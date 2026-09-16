import { expect, test } from '@playwright/test';

test.describe('Employer workspace', () => {
  test('mock employer can use the hiring dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.getByTestId('auth-employer')).toBeVisible();
    await page.getByTestId('auth-employer').click();
    await expect(page.getByTestId('employer-screen')).toBeVisible();
    await expect(page.getByTestId('employer-welcome')).toContainText('Sarah');
    await expect(page.getByTestId('employer-company')).toHaveText('Helios Health');
    await expect(page.getByTestId('kpi-Active Jobs')).toContainText('6');
    await expect(page.getByTestId('kpi-Total Applicants')).toContainText('184');
    await expect(page.getByTestId('kpi-Candidates Shortlisted')).toContainText('23');
    await expect(page.getByTestId('kpi-Interviews Scheduled')).toContainText('8');
    await expect(page.getByTestId('employer-job-job-analyst')).toContainText('Financial Analyst');
    await expect(page.getByTestId('employer-job-job-analyst')).toContainText('Phoenix, AZ');
    await expect(page.getByTestId('employer-job-job-analyst')).toContainText('42 Applicants');

    await page.getByTestId('job-filter-Draft').click();
    await expect(page.getByTestId('employer-job-job-draft')).toBeVisible();
    await expect(page.getByTestId('employer-job-job-analyst')).toHaveCount(0);
    await page.getByTestId('job-filter-All Jobs').click();

    await page.getByTestId('insights-job-analyst').click();
    await expect(page.getByTestId('employer-insights')).toBeVisible();
    await expect(page.getByText('AI Candidate Insights')).toBeVisible();
    await expect(page.getByText(/decision-support only/i)).toBeVisible();
    await expect(page.getByText('Excellent Match — 8 candidates')).toBeVisible();
    await expect(page.getByText('Excel — 86%')).toBeVisible();
    await expect(page.getByTestId('candidate-c-alex')).toBeVisible();

    await page.getByTestId('candidate-c-alex').getByText('View Profile').click();
    await expect(page.getByTestId('candidate-drawer')).toBeVisible();
    await expect(page.getByText('Why this candidate matches')).toBeVisible();
    await page.getByText('Shortlist Candidate').click();
    await page.getByTestId('candidate-drawer-close').click();

    await page.getByTestId('employer-nav-shortlist').click();
    await expect(page.getByTestId('employer-shortlist')).toBeVisible();
    await page.getByText('Select to compare').first().click();
    await page.getByText('Select to compare').first().click();
    await page.getByTestId('compare-candidates').click();
    await expect(page.getByTestId('compare-sheet')).toBeVisible();
    await expect(page.getByText('The employer still makes the hiring decision.')).toBeVisible();
    await page.getByTestId('compare-close').click();

    await page.getByTestId('employer-nav-settings').click();
    await expect(page.getByTestId('legal-links')).toBeVisible();
    await expect(page.getByTestId('support-button')).toContainText('support@orbit.app');
    await page.getByTestId('legal-link-terms').click();
    await expect(page.getByTestId('legal-sheet-terms')).toBeVisible();
    await page.getByTestId('legal-close').click();

    await page.getByTestId('employer-nav-billing').click();
    await expect(page.getByTestId('employer-billing')).toBeVisible();
    await expect(page.getByTestId('employer-plan-free')).toContainText('2 jobs included');
    await expect(page.getByTestId('employer-plan-free')).toContainText('₹25');
    await expect(page.getByTestId('employer-plan-starter')).toContainText('₹199');

    await page.getByTestId('employer-go-post').click();
    await expect(page.getByTestId('employer-post-screen')).toBeVisible();
    await page.getByTestId('employer-post-title').fill('Staff Backend Engineer');
    await page.getByTestId('employer-post-salary').fill('$120,000–$150,000 / year');
    await page.getByTestId('employer-publish').click();
    await expect(page.getByText('Staff Backend Engineer')).toBeVisible();

    await page.getByTestId('employer-sign-out').click();
    await expect(page.getByTestId('auth-screen')).toBeVisible();
  });
});
