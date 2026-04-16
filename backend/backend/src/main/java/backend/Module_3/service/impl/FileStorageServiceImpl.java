package backend.Module_3.service.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import backend.Module_3.entity.TicketAttachment;
import backend.Module_3.exception.BadRequestException;
import backend.Module_3.exception.ResourceNotFoundException;
import backend.Module_3.service.FileStorageService;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024 * 1024;

    private final Path uploadRoot;

    public FileStorageServiceImpl(@Value("${module3.upload-dir:uploads/module3}") String uploadDir) {
        try {
            this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadRoot);
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to initialize file storage", exception);
        }
    }

    @Override
    public List<TicketAttachment> storeAttachments(List<MultipartFile> files) {
        List<TicketAttachment> attachments = new ArrayList<>();
        if (files == null) {
            return attachments;
        }

        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }

            String originalName = StringUtils.cleanPath(file.getOriginalFilename());
            validateAttachment(file, originalName);
            String storedName = UUID.randomUUID() + "-" + originalName.replace(" ", "_");
            Path destination = uploadRoot.resolve(storedName);

            try {
                Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException exception) {
                throw new BadRequestException("Failed to store attachment " + originalName);
            }

            TicketAttachment attachment = new TicketAttachment();
            attachment.setId(UUID.randomUUID().toString());
            attachment.setOriginalFileName(originalName);
            attachment.setStoredFileName(storedName);
            attachment.setContentType(file.getContentType());
            attachment.setFileSize(file.getSize());
            attachment.setFileUrl("/api/module3/files/" + storedName);
            attachments.add(attachment);
        }

        return attachments;
    }

    private void validateAttachment(MultipartFile file, String originalName) {
        if (originalName.contains("..")) {
            throw new BadRequestException("Attachment filename is invalid");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException("Each attachment must be 5 MB or smaller");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            throw new BadRequestException("Attachments must be image files");
        }
    }

    @Override
    public Resource loadAsResource(String storedFileName) {
        try {
            Path filePath = uploadRoot.resolve(storedFileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) {
                throw new ResourceNotFoundException("Attachment file not found");
            }
            return resource;
        } catch (IOException exception) {
            throw new ResourceNotFoundException("Attachment file not found");
        }
    }
}
