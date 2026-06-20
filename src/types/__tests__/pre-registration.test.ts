import { isExpiringSoon } from "../pre-registration";
import type {
  PreRegistrationStatus,
  EnrollmentType,
  PreRegistrationContact,
  PreRegistrationListItem,
  PreRegistrationDetail,
  UpdatePreRegistrationDto,
} from "../pre-registration";

describe("isExpiringSoon", () => {
  it("returns true when expires_at is 2 days from now", () => {
    const twoDays = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    expect(isExpiringSoon(twoDays.toISOString())).toBe(true);
  });

  it("returns true when expires_at is today", () => {
    const now = new Date(Date.now() + 60 * 1000);
    expect(isExpiringSoon(now.toISOString())).toBe(true);
  });

  it("returns false when expires_at is 4 days from now", () => {
    const fourDays = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
    expect(isExpiringSoon(fourDays.toISOString())).toBe(false);
  });

  it("returns false for null expires_at", () => {
    expect(isExpiringSoon(null)).toBe(false);
  });

  it("returns true when expires_at is exactly 3 days from now", () => {
    const threeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    expect(isExpiringSoon(threeDays.toISOString())).toBe(true);
  });
});

// Type shape smoke tests — compile-time validation via assignment
const _status: PreRegistrationStatus = "pending";
const _type: EnrollmentType = "subscription";

const _contact: PreRegistrationContact = {
  id: 1,
  full_name: "Jose Santos",
  relationship: "Father",
  phone: "09123456789",
  email: null,
  address: "123 Main St",
  is_primary: true,
};

const _listItem: PreRegistrationListItem = {
  id: 1,
  first_name: "Maria",
  last_name: "Santos",
  full_name: "Maria Santos",
  status: "pending",
  enrollment_type: "subscription",
  submitted_at: "2026-06-15T00:00:00Z",
  expires_at: "2026-06-25T00:00:00Z",
  contact_name: "Jose Santos",
};

const _detail: PreRegistrationDetail = {
  ..._listItem,
  student_number: "SB-123456",
  grade_level: "Grade 2",
  section: null,
  birthday: "2020-03-05",
  allergies: null,
  notes: null,
  subscription_start_month: "june",
  subscription_start_year: 2026,
  subscription_end_month: "march",
  subscription_end_year: 2027,
  contacts: [_contact],
  rejection_reason: null,
  rejected_by: null,
  approved_by: null,
  processed_at: null,
  recaptcha_score: 0.9,
  submitter_ip: "192.168.1.1",
  duplicate_warning: false,
  existing_student_name: null,
};

const _dto: UpdatePreRegistrationDto = {
  first_name: "Maria",
  grade_level: "Grade 3",
};

void _status;
void _type;
void _contact;
void _listItem;
void _detail;
void _dto;
