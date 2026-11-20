import { expect } from "@playwright/test";
import test from "@playwright/test";

test.describe("SignIn", () => {
    test("should sign in successfully with valid credentials", async ({ page }) => {
        await page.goto("http://localhost:8000/login");
        const emailInput=page.getByRole('textbox', {name:'email'});
        await emailInput.fill('admin@ems.test');
        await expect(emailInput).toHaveValue('admin@ems.test');
        const passwordInput=page.getByRole('textbox', {name:'password'});
        await passwordInput.fill('password');
        await expect(passwordInput).toHaveValue('password');
        const signinButton=page.getByRole('button', {name:'Sign In'});
        await signinButton.click();
        await expect(page).toHaveURL('http://localhost:8000');
    });

    test('fails on empty email field', async({page})=>{
        await page.goto('http://localhost:8000/login');
        const emailInput=page.getByRole('textbox', {name:'email'});
        await emailInput.fill('');
        const passwordInput=page.getByRole('textbox', {name:'password'});
        await passwordInput.fill('password');
        const signinButton=page.getByRole('button', {name:'Sign In'});
        await signinButton.click();
        await expect(page.getByRole('tooltip')).toBeVisible();
    });

});
