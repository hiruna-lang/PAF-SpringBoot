package backend.Module_3.service;

import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import backend.Module_3.entity.TicketAttachment;

public interface FileStorageService {
    List<TicketAttachment> storeAttachments(List<MultipartFile> files);
    Resource loadAsResource(String storedFileName);
}
