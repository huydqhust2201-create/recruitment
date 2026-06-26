package com.example.be.service.impl;

import com.example.be.dto.request.ApplicationRequest;
import com.example.be.dto.request.UpdateApplicationStatusRequest;
import com.example.be.dto.response.ApplicationResponse;
import com.example.be.entity.*;
import com.example.be.entity.enums.ApplicationStatus;
import com.example.be.entity.enums.JobStatus;
import com.example.be.entity.enums.NotificationType;
import com.example.be.repository.*;
import com.example.be.service.inf.ApplicationService;
import com.example.be.service.inf.AiScoringService;
import com.example.be.service.inf.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationNoteRepository applicationNoteRepository;
    private final StageTransitionRepository stageTransitionRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final CvFileRepository cvFileRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final AiScoringService aiScoringService;
    private final AiScoreResultRepository aiScoreResultRepository;
    private final EmailServiceImpl emailService;
    private final NotificationService notificationService;

    private static final String STATUS_CHANGED_TITLE = "Cập nhật trạng thái đơn ứng tuyển";
    private static final String NEW_APP_TITLE = "Có ứng viên mới ứng tuyển";

    @Override
    public ApplicationResponse apply(ApplicationRequest request, UUID candidateUserId) {
        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new RuntimeException("Khong tim thay job"));

        if (job.getStatus() != JobStatus.ACTIVE) {
            throw new RuntimeException("Job khong con mo de ung tuyen");
        }

        if (applicationRepository.existsByJobIdAndCandidateId(job.getId(), candidateUserId)) {
            throw new RuntimeException("Ban da ung tuyen job nay roi");
        }

        User candidate = userRepository.findById(candidateUserId)
                .orElseThrow(() -> new RuntimeException("User khong ton tai"));

        CandidateProfile profile = candidateProfileRepository.findByUserId(candidateUserId)
                .orElseThrow(() -> new RuntimeException("Ban chua co ho so ung vien"));

        CvFile cvFile = cvFileRepository.findById(request.getCvFileId())
                .orElseThrow(() -> new RuntimeException("Khong tim thay CV"));

        if (!cvFile.getCandidate().getId().equals(profile.getId())) {
            throw new RuntimeException("CV khong thuoc ve ban");
        }

        Application application = Application.builder()
                .job(job)
                .candidate(candidate)
                .cvFile(cvFile)
                .coverLetter(request.getCoverLetter())
                .status(ApplicationStatus.SUBMITTED)
                .build();

        applicationRepository.save(application);

        job.setApplyCount(job.getApplyCount() + 1);
        jobRepository.save(job);

        recordTransition(application, candidate, null, ApplicationStatus.SUBMITTED, null);

        // Notify recruiter of new application
        User recruiter = job.getRecruiter();
        String applyMsg = "Ứng viên " + candidate.getFullName() + " vừa nộp đơn vào vị trí \"" + job.getTitle() + "\"";
        notificationService.create(recruiter.getId(), NEW_APP_TITLE, applyMsg,
                NotificationType.NEW_APPLICATION, "/recruiter/jobs/" + job.getId() + "/applications");
        emailService.sendNewApplicationAlert(recruiter.getEmail(), recruiter.getFullName(),
                candidate.getFullName(), job.getTitle());

        // Chi cham diem AI SAU KHI transaction nay commit thanh cong.
        // Neu goi truc tiep o day, thread async co the chay truoc khi
        // row "applications" duoc commit, dan den "Khong tim thay don ung tuyen".
        UUID newApplicationId = application.getId();
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    aiScoringService.scoreApplicationAsync(newApplicationId);
                }
            });
        } else {
            aiScoringService.scoreApplicationAsync(newApplicationId);
        }

        return mapToResponse(application);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getMyApplications(UUID candidateUserId) {
        return applicationRepository.findByCandidateIdOrderByAppliedAtDesc(candidateUserId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ApplicationResponse> getMyApplicationForJob(UUID jobId, UUID candidateUserId) {
        return applicationRepository.findByJobIdAndCandidateId(jobId, candidateUserId)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getAllApplicationsForRecruiter(UUID recruiterUserId) {
        List<UUID> jobIds = jobRepository.findByRecruiterId(recruiterUserId)
                .stream().map(Job::getId).collect(Collectors.toList());
        if (jobIds.isEmpty()) return List.of();
        return applicationRepository.findByJobIdInOrderByScore(jobIds)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsByJob(UUID jobId, UUID recruiterUserId) {
        Job job = getJobAndValidateOwner(jobId, recruiterUserId);
        return applicationRepository.findByJobIdOrderByAiMatchScoreDesc(job.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationResponse getByIdForRecruiter(UUID id, UUID recruiterUserId) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay don ung tuyen"));
        getJobAndValidateOwner(application.getJob().getId(), recruiterUserId);
        return mapToResponse(application);
    }

    @Override
    public ApplicationResponse updateStatus(
            UUID id,
            UpdateApplicationStatusRequest request,
            UUID actorUserId,
            boolean isCandidate) {

        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay don ung tuyen"));

        User actor = userRepository.findById(actorUserId)
                .orElseThrow(() -> new RuntimeException("User khong ton tai"));

        ApplicationStatus fromStatus = application.getStatus();
        ApplicationStatus toStatus = request.getStatus();

        if (isCandidate) {
            if (!application.getCandidate().getId().equals(actorUserId)) {
                throw new RuntimeException("Ban khong co quyen cap nhat don nay");
            }
            if (toStatus != ApplicationStatus.WITHDRAWN) {
                throw new RuntimeException("Ung vien chi duoc rut don (WITHDRAWN)");
            }
            if (fromStatus == ApplicationStatus.WITHDRAWN || fromStatus == ApplicationStatus.REJECTED) {
                throw new RuntimeException("Khong the rut don o trang thai hien tai");
            }
        } else {
            getJobAndValidateOwner(application.getJob().getId(), actorUserId);
            if (toStatus == ApplicationStatus.WITHDRAWN) {
                throw new RuntimeException("Recruiter khong the dat trang thai WITHDRAWN");
            }
        }

        application.setStatus(toStatus);
        applicationRepository.save(application);

        recordTransition(application, actor, fromStatus, toStatus, request.getNote());

        if (request.getNote() != null && !request.getNote().isBlank() && !isCandidate) {
            ApplicationNote note = ApplicationNote.builder()
                    .application(application)
                    .recruiter(actor)
                    .content(request.getNote().trim())
                    .isPrivate(true)
                    .build();
            applicationNoteRepository.save(note);
        }

        // Send email + in-app notification to candidate when recruiter changes status
        if (!isCandidate) {
            User candidate = application.getCandidate();
            String jobTitle = application.getJob().getTitle();
            String companyName = application.getJob().getCompany().getName();
            String statusName = toStatus.name();

            emailService.sendApplicationStatusChanged(
                    candidate.getEmail(), candidate.getFullName(),
                    jobTitle, companyName, statusName);

            String msg = "Đơn ứng tuyển vị trí \"" + jobTitle + "\" tại " + companyName
                    + " đã được cập nhật: " + statusName;
            notificationService.create(candidate.getId(), STATUS_CHANGED_TITLE, msg,
                    NotificationType.APPLICATION_STATUS, "/candidate/applications");
        }

        return mapToResponse(application);
    }

    private Job getJobAndValidateOwner(UUID jobId, UUID recruiterUserId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay job"));
        if (!job.getRecruiter().getId().equals(recruiterUserId)) {
            throw new RuntimeException("Ban khong co quyen xem ung vien cua job nay");
        }
        return job;
    }

    private void recordTransition(
            Application application,
            User changedBy,
            ApplicationStatus fromStatus,
            ApplicationStatus toStatus,
            String note) {
        StageTransition transition = StageTransition.builder()
                .application(application)
                .changedBy(changedBy)
                .fromStatus(fromStatus)
                .toStatus(toStatus)
                .note(note)
                .build();
        stageTransitionRepository.save(transition);
    }

    private ApplicationResponse mapToResponse(Application application) {
        Job job = application.getJob();
        User candidate = application.getCandidate();
        CvFile cvFile = application.getCvFile();

        ApplicationResponse.ApplicationResponseBuilder builder = ApplicationResponse.builder()
                .id(application.getId())
                .jobId(job.getId())
                .jobTitle(job.getTitle())
                .companyName(job.getCompany().getName())
                .candidateId(candidate.getId())
                .candidateFullName(candidate.getFullName())
                .candidateEmail(candidate.getEmail())
                .cvFileId(cvFile.getId())
                .cvFileUrl(cvFile.getFileUrl())
                .coverLetter(application.getCoverLetter())
                .status(application.getStatus().name())
                .aiMatchScore(application.getAiMatchScore())
                .passedThreshold(application.getPassedThreshold())
                .appliedAt(application.getAppliedAt())
                .updatedAt(application.getUpdatedAt());

        candidateProfileRepository.findByUserId(candidate.getId()).ifPresent(profile -> {
            builder.candidateHeadline(profile.getHeadline());
            builder.candidateCurrentPosition(profile.getCurrentPosition());
            builder.candidateYearsExp(profile.getYearsOfExperience());
            builder.candidateCity(profile.getCity());
        });

        aiScoreResultRepository.findByApplicationId(application.getId()).ifPresent(score -> {
            builder.skillScore(score.getSkillScore());
            builder.experienceScore(score.getExperienceScore());
            builder.educationScore(score.getEducationScore());
        });

        return builder.build();
    }
}
