package com.example.be.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import com.example.be.entity.enums.Role;

@Data
public class RegisterRequest {

    @NotBlank(message = "Email khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    @Email(message = "Email khÃ´ng Ä‘Ãºng Ä‘á»‹nh dáº¡ng")
    private String email;

    @NotBlank(message = "Máº­t kháº©u khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    @Size(min = 6, message = "Máº­t kháº©u pháº£i Ã­t nháº¥t 6 kÃ½ tá»±")
    private String password;

    @NotBlank(message = "Há» tÃªn khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng")
    private String fullName;

    private String phone;

    private Role role; // CANDIDATE hoáº·c RECRUITER
}
