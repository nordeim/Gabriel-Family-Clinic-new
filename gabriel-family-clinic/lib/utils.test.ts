import {
  cn,
  formatDateSG,
  formatCurrencySGD,
  isValidSGPhone,
  formatSGPhone,
  getInitials,
  isPastDate,
} from "../utils";

describe("Utility Functions", () => {
  describe("cn - className merge utility", () => {
    it("should merge class names correctly", () => {
      expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    });

    it("should handle conditional classes", () => {
      expect(cn("base", true && "active", false && "disabled")).toBe("base active");
    });
  });

  describe("formatDateSG - Singapore date formatting", () => {
    const testDate = new Date("2025-03-15T10:30:00");

    it("should format date in short format (DD/MM/YYYY)", () => {
      const formatted = formatDateSG(testDate, "short");
      expect(formatted).toContain("15");
      expect(formatted).toContain("03");
      expect(formatted).toContain("2025");
    });

    it("should format date in long format", () => {
      const formatted = formatDateSG(testDate, "long");
      expect(formatted).toContain("March");
      expect(formatted).toContain("2025");
    });

    it("should format time correctly", () => {
      const formatted = formatDateSG(testDate, "time");
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });

    it("should handle string date input", () => {
      const formatted = formatDateSG("2025-03-15", "short");
      expect(formatted).toBeTruthy();
    });
  });

  describe("formatCurrencySGD - Singapore currency formatting", () => {
    it("should format currency with SGD symbol", () => {
      expect(formatCurrencySGD(100)).toContain("100");
      expect(formatCurrencySGD(100)).toMatch(/SGD|S\$/);
    });

    it("should handle decimals correctly", () => {
      const formatted = formatCurrencySGD(99.99);
      expect(formatted).toContain("99.99");
    });

    it("should format large amounts", () => {
      const formatted = formatCurrencySGD(1000000);
      expect(formatted).toBeTruthy();
    });
  });

  describe("isValidSGPhone - Singapore phone validation", () => {
    it("should validate correct Singapore phone numbers", () => {
      expect(isValidSGPhone("91234567")).toBe(true);
      expect(isValidSGPhone("81234567")).toBe(true);
      expect(isValidSGPhone("61234567")).toBe(true);
    });

    it("should validate phone numbers with +65 prefix", () => {
      expect(isValidSGPhone("+6591234567")).toBe(true);
      expect(isValidSGPhone("6591234567")).toBe(true);
    });

    it("should validate phone numbers with spaces", () => {
      expect(isValidSGPhone("+65 9123 4567")).toBe(true);
      expect(isValidSGPhone("9123 4567")).toBe(true);
    });

    it("should reject invalid phone numbers", () => {
      expect(isValidSGPhone("12345678")).toBe(false);  // Wrong first digit
      expect(isValidSGPhone("9123456")).toBe(false);   // Too short
      expect(isValidSGPhone("912345678")).toBe(false); // Too long
    });
  });

  describe("formatSGPhone - Singapore phone formatting", () => {
    it("should format phone number with +65 and spaces", () => {
      const formatted = formatSGPhone("91234567");
      expect(formatted).toMatch(/\+65 \d{4} \d{4}/);
    });

    it("should handle phone numbers with +65 prefix", () => {
      const formatted = formatSGPhone("6591234567");
      expect(formatted).toContain("+65");
    });
  });

  describe("getInitials - Name initials extraction", () => {
    it("should get initials from full name", () => {
      expect(getInitials("John Doe")).toBe("JD");
      expect(getInitials("Mary Jane Watson")).toBe("MW");
    });

    it("should handle single name", () => {
      expect(getInitials("John")).toBe("J");
    });

    it("should handle extra spaces", () => {
      expect(getInitials("  John  Doe  ")).toBe("JD");
    });

    it("should return uppercase initials", () => {
      expect(getInitials("john doe")).toBe("JD");
    });
  });

  describe("isPastDate - Date comparison", () => {
    it("should return true for past dates", () => {
      const pastDate = new Date("2020-01-01");
      expect(isPastDate(pastDate)).toBe(true);
    });

    it("should return false for future dates", () => {
      const futureDate = new Date("2030-01-01");
      expect(isPastDate(futureDate)).toBe(false);
    });

    it("should handle string dates", () => {
      expect(isPastDate("2020-01-01")).toBe(true);
      expect(isPastDate("2030-01-01")).toBe(false);
    });
  });
});
