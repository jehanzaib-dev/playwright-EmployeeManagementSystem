import {test,expect, Page} from '@playwright/test';

test.describe('Employee related tests', ()=>{
    async function deletionHelperFunction(page:Page, employeeName:string, action:'ok' | 'cancel' ):Promise<void>{
        const employeeRow=page.getByRole('row').filter({hasText:employeeName});
        const deleteButton=employeeRow.getByRole('button', {name:'Delete'});
        //await expect(deleteButton).toBeVisible();
        page.once('dialog', async dialog=>{
            expect(dialog.type()).toBe('confirm');
            expect(dialog.message()).toBe(`Delete ${employeeName}?`);
            if(action==='ok'){
                await dialog.accept();
                await expect(employeeRow).toHaveCount(0);
            }
            else if(action==='cancel'){
                await dialog.dismiss();
                await expect(employeeRow).toBeVisible();
            }

        });
        await deleteButton.click();
    }
    test.beforeEach(async({page})=>{
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

    test('create and verify new employee', async({page})=>{
        
        const addEmployeeButton=page.getByRole('link', {name:'Add Employee'});
        await addEmployeeButton.click();
        await expect(page).toHaveURL('http://localhost:8000/employees/new');
        await page.getByRole('textbox', {name:"First name"}).fill('playwright');
        const timestamp=Date.now();
        const lastName=`Employee-${timestamp}`;
        await page.getByRole('textbox', {name:"Last name"}).fill(lastName);
        const employeeEmail=`playwright-${timestamp}@gmail.com`;
        await page.getByRole('textbox', {name:"Email"}).fill(employeeEmail);
        await page.getByRole('textbox', {name:"Job title"}).fill('automator');
        await page.getByRole('combobox', {name:'Department'}).selectOption('4');
        const hireDate=page.getByLabel('Hire date');
        await hireDate.fill('2026-11-13');
        await expect(hireDate).toHaveValue('2026-11-13');
        const salaryInput=page.getByRole('spinbutton', {name:'Salary'});
        await salaryInput.fill('40000');
        const statusInput=page.getByRole('combobox', {name:'status'});
        await statusInput.selectOption('on_leave');
        await expect(statusInput).toHaveValue('on_leave');
        const responsePromise=page.waitForResponse(response=> response.url().includes('/api/employees') && response.request().method()==='POST');
        await page.getByRole('button', {name:"Save"}).click();
        const response=await responsePromise;
        expect(response.status()).toBe(201);
        const employeeData=await response.json();
        expect(employeeData.email).toBe(employeeEmail);
        const employeeListResponsePromise=page.waitForResponse(response=>response.url().includes('/api/employees') && response.request().method()==='GET');
        await expect(page).toHaveURL('http://localhost:8000/employees');
        const employeeListResponse=await employeeListResponsePromise;
        expect(employeeListResponse.status()).toBe(200);
        const searchInput = page.getByPlaceholder(/Search by name, email, or job title/i);
        await expect(searchInput).toBeVisible();
        await searchInput.fill(lastName);
        const targetRow=page.getByRole('row').filter({hasText:lastName});
        await expect(targetRow).toBeVisible();
        const editButton=targetRow.getByRole('link', {name:'Edit'});
        //await expect(editButton).toBeVisible();
        await editButton.click();
        const employeeId=employeeData.id;
        await expect(page).toHaveURL(`http://localhost:8000/employees/${employeeId}/edit`);
        await expect(page.getByRole('heading', {name:'Edit Employee'})).toBeVisible();
        await expect(page);
        await expect(page.getByRole('textbox', {name:'Email'})).toHaveValue(employeeEmail);
    });
    test('should delete an employee', async({page})=>{
        await deletionHelperFunction(page, 'abbas ali', 'ok');
    });
    test('should cancel an employee deletion', async({page})=>{
        await deletionHelperFunction(page, 'Muhammad Ibrahim', 'cancel');
    });

});
