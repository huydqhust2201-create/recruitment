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

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final UserRepository userRepository;

    @Override
    public CompanyResponse create(CompanyRequest request, UUID userId) {

        // 1. Kiá»ƒm tra tÃªn cÃ´ng ty Ä‘Ã£ tá»“n táº¡i chÆ°a
        if (companyRepository.existsByName(request.getName())) {
            throw new RuntimeException("TÃªn cÃ´ng ty Ä‘Ã£ tá»“n táº¡i");
        }

        // 2. Táº¡o slug tá»« tÃªn cÃ´ng ty
        String slug = generateSlug(request.getName());

        // 3. Táº¡o company
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

        // 4. Táº¡o recruiter profile cho user vÃ  gáº¯n vÃ o company
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User khÃ´ng tá»“n táº¡i"));

        // Náº¿u chÆ°a cÃ³ profile thÃ¬ táº¡o má»›i
        if (!recruiterProfileRepository.existsByUserId(userId)) {
            RecruiterProfile profile = RecruiterProfile.builder()
                    .user(user)
                    .company(company)
                    .build();
            recruiterProfileRepository.save(profile);
        }

        return mapToResponse(company);
    }

    @Override
    public CompanyResponse getById(UUID id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("KhÃ´ng tÃ¬m tháº¥y cÃ´ng ty"));
        return mapToResponse(company);
    }

    @Override
    public CompanyResponse getBySlug(String slug) {
        Company company = companyRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("KhÃ´ng tÃ¬m tháº¥y cÃ´ng ty"));
        return mapToResponse(company);
    }

    @Override
    public CompanyResponse update(UUID id, CompanyRequest request, UUID userId) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("KhÃ´ng tÃ¬m tháº¥y cÃ´ng ty"));

        company.setName(request.getName());
        company.setWebsite(request.getWebsite());
        company.setIndustry(request.getIndustry());
        company.setCompanySize(request.getCompanySize());
        company.setDescription(request.getDescription());
        company.setCity(request.getCity());

        companyRepository.save(company);
        return mapToResponse(company);
    }

    // â”€â”€ Helper methods â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    private String generateSlug(String name) {
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", ""); // xÃ³a dáº¥u trong unicode
        normalized = normalized.replace("Ä‘", "d").replace("Ä", "D");
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
