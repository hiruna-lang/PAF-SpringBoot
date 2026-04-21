export const VALIDATION_LIMITS = {
  ticket: {
    maxResourceLength: 120,
    maxCategoryLength: 80,
    maxContactLength: 120,
    maxDescriptionLength: 1000,
    maxAttachments: 3,
    maxAttachmentSizeBytes: 5 * 1024 * 1024,
  },
  technician: {
    maxNameLength: 80,
    maxSpecializationLength: 80,
    maxPhoneLength: 20,
    maxEmailLength: 120,
    minPasswordLength: 8,
    maxPasswordLength: 64,
  },
  comment: {
    maxMessageLength: 500,
  },
  rejection: {
    maxReasonLength: 500,
  },
  resolution: {
    maxNotesLength: 1000,
  },
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+()\-\s]{7,20}$/;

function isPhoneOrEmail(value) {
  return EMAIL_PATTERN.test(value) || PHONE_PATTERN.test(value);
}

export function validateTicketForm(formData, files) {
  const errors = {};
  const resource = formData.resource.trim();
  const category = formData.category.trim();
  const description = formData.description.trim();
  const preferredContact = formData.preferredContact.trim();

  if (!resource) {
    errors.resource = "Resource or location is required.";
  } else if (resource.length > VALIDATION_LIMITS.ticket.maxResourceLength) {
    errors.resource = "Resource or location must be 120 characters or fewer.";
  }

  if (!category) {
    errors.category = "Category is required.";
  } else if (category.length > VALIDATION_LIMITS.ticket.maxCategoryLength) {
    errors.category = "Category must be 80 characters or fewer.";
  }

  if (!description) {
    errors.description = "Description is required.";
  } else if (description.length > VALIDATION_LIMITS.ticket.maxDescriptionLength) {
    errors.description = "Description must be 1000 characters or fewer.";
  }

  if (!preferredContact) {
    errors.preferredContact = "Preferred contact is required.";
  } else if (preferredContact.length > VALIDATION_LIMITS.ticket.maxContactLength) {
    errors.preferredContact = "Preferred contact must be 120 characters or fewer.";
  } else if (!isPhoneOrEmail(preferredContact)) {
    errors.preferredContact = "Preferred contact must be a valid phone number or email address.";
  }

  if (files.length > VALIDATION_LIMITS.ticket.maxAttachments) {
    errors.attachments = "Only 3 attachments are allowed.";
  } else if (files.some(({ file }) => file.size > VALIDATION_LIMITS.ticket.maxAttachmentSizeBytes)) {
    errors.attachments = "Each attachment must be 5 MB or smaller.";
  } else if (files.some(({ file }) => !file.type.startsWith("image/"))) {
    errors.attachments = "Attachments must be image files.";
  }

  return errors;
}

export function validateTechnicianForm(formData) {
  const errors = {};
  const name = formData.name.trim();
  const specialization = formData.specialization.trim();
  const email = formData.email.trim();
  const phone = formData.phone.trim();
  const password = formData.password;

  if (!name) {
    errors.name = "Operative name is required.";
  } else if (name.length > VALIDATION_LIMITS.technician.maxNameLength) {
    errors.name = "Operative name must be 80 characters or fewer.";
  }

  if (!specialization) {
    errors.specialization = "Division specialization is required.";
  } else if (specialization.length > VALIDATION_LIMITS.technician.maxSpecializationLength) {
    errors.specialization = "Division specialization must be 80 characters or fewer.";
  }

  if (!email) {
    errors.email = "Comms email is required.";
  } else if (email.length > VALIDATION_LIMITS.technician.maxEmailLength) {
    errors.email = "Comms email must be 120 characters or fewer.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Comms email must be a valid email address.";
  }

  if (phone && phone.length > VALIDATION_LIMITS.technician.maxPhoneLength) {
    errors.phone = "Direct line must be 20 characters or fewer.";
  } else if (phone && !PHONE_PATTERN.test(phone)) {
    errors.phone = "Direct line must be a valid phone number.";
  }

  if (!password.trim()) {
    errors.password = "Access credential is required.";
  } else if (password.length < VALIDATION_LIMITS.technician.minPasswordLength || password.length > VALIDATION_LIMITS.technician.maxPasswordLength) {
    errors.password = "Access credential must be between 8 and 64 characters.";
  }

  return errors;
}
