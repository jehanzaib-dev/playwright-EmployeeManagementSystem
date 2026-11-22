import test, {expect} from '@playwright/test';

test.describe('Employee page tests', ()=>{

    test('create new employee', async({page})=>{
        await page.goto('http://localhost:8000/login');
        await expect(page).toHaveURL('http://localhost:8000/login');
        const emailInput=page.getByRole('textbox', {name:'email'});
        await emailInput.fill('admin@ems.test');
        const passwordInput=page.getByRole('textbox', {name:'password'});
        await passwordInput.fill('password');
        const signinButton=page.getByRole('button', {name:'Sign in'});
        await signinButton.click();
        await expect(page).toHaveTitle('Employee Management System');
        const employeesLink=page.getByRole('link', {name:'Employees'});
        await employeesLink.click();
        await expect(page).toHaveURL('http://localhost:8000/employees');
    });

});
