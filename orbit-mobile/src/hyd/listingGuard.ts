export type ListingDraft = {
  title: string;
  company?: string;
  location: string;
  salary: string;
  tags?: string;
  jobType?: string;
};

const FEE_PATTERN =
  /registration fee|security deposit|interview fee|pay to apply|training fee|equipment fee|joining fee|processing fee|to get this job pay|pay .{0,24}(registration|interview|training|deposit)/i;

const HIDDEN_PAY = /^(competitive|negotiable|as per industry|doe|n\/a|-)?$/i;

export function listingProblems(input: ListingDraft): string[] {
  const problems: string[] = [];
  const title = input.title.trim();
  const company = (input.company ?? '').trim();
  const location = input.location.trim();
  const salary = input.salary.trim();
  const blob = `${title} ${input.tags ?? ''} ${salary} ${input.jobType ?? ''}`;

  if (title.length < 2) problems.push('Add a role title.');
  if (!company) problems.push('Show the real employer identity.');
  if (location.length < 2) problems.push('State the job location.');
  if (salary.length < 2 || HIDDEN_PAY.test(salary)) {
    problems.push('State a real salary or stipend range. Do not hide pay behind Competitive or Negotiable.');
  }
  if (FEE_PATTERN.test(blob)) {
    problems.push(
      'Orbit does not allow jobs that charge candidates for registration, equipment, training, deposits, or interviews.',
    );
  }
  return problems;
}

export function assertSafeListing(input: ListingDraft): { ok: true } | { ok: false; error: string; problems: string[] } {
  const problems = listingProblems(input);
  if (problems.length === 0) return { ok: true };
  return { ok: false, error: problems[0], problems };
}
