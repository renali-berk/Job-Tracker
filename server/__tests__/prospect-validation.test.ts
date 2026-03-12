import { validateProspect } from "../prospect-helpers";

describe("prospect creation validation", () => {
  test("rejects a blank company name", () => {
    const result = validateProspect({
      companyName: "",
      roleTitle: "Software Engineer",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Company name is required");
  });

  test("rejects a blank role title", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Role title is required");
  });
});

describe("salary validation", () => {
  test("accepts valid salary range", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
      salaryMin: 80,
      salaryMax: 120,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("accepts equal lower and upper salary (single point range)", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
      salaryMin: 100,
      salaryMax: 100,
    });

    expect(result.valid).toBe(true);
  });

  test("accepts missing salary (both null)", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
      salaryMin: null,
      salaryMax: null,
    });

    expect(result.valid).toBe(true);
  });

  test("accepts partial salary (only lower bound provided)", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
      salaryMin: 80,
    });

    expect(result.valid).toBe(true);
  });

  test("accepts partial salary (only upper bound provided)", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
      salaryMax: 120,
    });

    expect(result.valid).toBe(true);
  });

  test("rejects lower salary of zero", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
      salaryMin: 0,
      salaryMax: 120,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Lower salary must be a positive number");
  });

  test("rejects negative lower salary", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
      salaryMin: -50,
      salaryMax: 120,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Lower salary must be a positive number");
  });

  test("rejects negative upper salary", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
      salaryMin: 80,
      salaryMax: -10,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Upper salary must be a positive number");
  });

  test("rejects upper salary less than lower salary", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
      salaryMin: 120,
      salaryMax: 80,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Upper salary must be greater than or equal to lower salary");
  });

  test("rejects non-integer lower salary", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
      salaryMin: 80.5,
      salaryMax: 120,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Lower salary must be a positive number");
  });

  test("rejects non-integer upper salary", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
      salaryMin: 80,
      salaryMax: 120.9,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Upper salary must be a positive number");
  });

  test("accumulates multiple salary errors", () => {
    const result = validateProspect({
      companyName: "Acme",
      roleTitle: "Engineer",
      salaryMin: -10,
      salaryMax: -20,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Lower salary must be a positive number");
    expect(result.errors).toContain("Upper salary must be a positive number");
  });
});
