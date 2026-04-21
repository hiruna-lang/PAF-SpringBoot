package backend.Module_3.controller;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import backend.Module_3.service.FileStorageService;

@RestController
@RequestMapping("/api/module3/files")
public class FileController {

    private final FileStorageService fileStorageService;

    public FileController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @GetMapping("/{storedFileName:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String storedFileName) {
        Resource resource = fileStorageService.loadAsResource(storedFileName);
        MediaType contentType = MediaType.APPLICATION_OCTET_STREAM;

        try {
            String detectedType = resource.getFile() != null ? java.nio.file.Files.probeContentType(resource.getFile().toPath()) : null;
            if (detectedType != null) {
                contentType = MediaType.parseMediaType(detectedType);
            }
        } catch (Exception ignored) {
        }

        return ResponseEntity.ok()
                .contentType(contentType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
