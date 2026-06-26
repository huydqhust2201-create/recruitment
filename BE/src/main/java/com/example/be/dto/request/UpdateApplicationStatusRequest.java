package com.example.be.dto.request;

import com.example.be.entity.enums.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateApplicationStatusRequest {

    @NotNull(message = "status không được để trống")
    private ApplicationStatus status;

    private String note;
}
