package com.example.be.service.impl;

import com.example.be.dto.request.CompanyRequest;
import com.example.be.dto.response.CompanyResponse;
import com.example.be.entity.Company;
import com.example.be.entity.RecruiterProfile;
import com.example.be.entity.User;
import com.example.be.repository.CompanyRepository;
import com.example.be.repository.RecruiterProfileRepository;
import com.example.be.repository.UserRepository;
import com.example.be.service.inf.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.text.Normalizer;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final UserRepository userRepository;

    @Override
    public CompanyResponse create(CompanyRequest request, UUID userId) {

        // 1. Kiem tra ten cong ty da ton tai chua
        if (companyRepository.existsByName(request.getName())) {
            throw new RuntimeException("Ten cong ty da ton tai");
        }

        // 2. Tao slug tu ten cong ty
        String slug = generateSlug(request.getName());

        // 3. Tao company
        Company company = Company.builder()
                .name(request.getName())
                .slug(slug)
                .website(request.getWebsite())
                .industry(request.getIndustry())
                .companySize(request.getCompanySize())
                .description(request.getDescription())
                .city(request.getCity())
                .build();

        companyRepository.save(company);

        // 4. Gan company vao recruiter profile (tao moi hoac cap nhat)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User khong ton tai"));

        RecruiterProfile profile = recruiterProfileRepository.findByUserId(userId)
                .orElse(RecruiterProfile.builder().user(user).build());
        profile.setCompany(company);
        recruiterProfileRepository.save(profile);

        return mapToResponse(company);
    }

    @Override
    public Optional<CompanyResponse> getByRecruiterId(UUID userId) {
        return recruiterProfileRepository.findCompanyByUserId(userId)
                .map(this::mapToResponse);
    }

    @Override
    public CompanyResponse getById(UUID id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay cong ty"));
        return mapToResponse(company);
    }

    @Override
    public CompanyResponse getBySlug(String slug) {
        Company company = companyRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Khong tim thay cong ty"));
        return mapToResponse(company);
    }

    @Override
    public CompanyResponse update(UUID id, CompanyRequest request, UUID userId) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay cong ty"));

        RecruiterProfile profile = recruiterProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Ban chua co ho so recruiter"));

        if (profile.getCompany() == null || !profile.getCompany().getId().equals(id)) {
            throw new RuntimeException("Ban khong co quyen cap nhat cong ty nay");
        }

        company.setName(request.getName());
        company.setWebsite(request.getWebsite());
        company.setIndustry(request.getIndustry());
        company.setCompanySize(request.getCompanySize());
        company.setDescription(request.getDescription());
        company.setCity(request.getCity());

        companyRepository.save(company);
        return mapToResponse(company);
    }

    // Helper methods
    private String generateSlug(String name) {
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        normalized = normalized.replace("d", "d").replace("D", "D");
        String slug = normalized.toLowerCase()
                .trim()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");

        String finalSlug = slug;
        int count = 1;
        while (companyRepository.existsBySlug(finalSlug)) {
            finalSlug = slug + "-" + count++;
        }
        return finalSlug;
    }

    private CompanyResponse mapToResponse(Company company) {
        return CompanyResponse.builder()
                .id(company.getId())
                .name(company.getName())
                .slug(company.getSlug())
                .logoUrl(company.getLogoUrl())
                .website(company.getWebsite())
                .industry(company.getIndustry())
                .companySize(company.getCompanySize())
                .description(company.getDescription())
                .city(company.getCity())
                .isVerified(company.isVerified())
                .build();
    }
}
