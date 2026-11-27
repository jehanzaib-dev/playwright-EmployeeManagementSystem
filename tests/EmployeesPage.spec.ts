import {test,expect, Page} from '@playwright/test';

test.describe('Employee related tests', ()=>{
    
    async function creationHelperFunction(page:Page, firstName:string, jobTitle:string, department:string, hireDate:string, salary:string, status:string){
        const addEmployeeButton=page.getByRole('link', {name:'Add Employee'});
        await addEmployeeButton.click();
        await expect(page).toHaveURL('http://localhost:8000/employees/new');
        await page.getByRole('textbox', {name:"First name"}).fill(firstName);
        const timestamp=Date.now();
        const lastName=`Employee-${timestamp}`;
        await page.getByRole('textbox', {name:"Last name"}).fill(lastName);
        const employeeEmail=`playwright-${timestamp}@gmail.com`;
        await page.getByRole('textbox', {name:"Email"}).fill(employeeEmail);
        await page.getByRole('textbox', {name:"Job title"}).fill(jobTitle);
        await page.getByRole('combobox', {name:'Department'}).selectOption(department);
        await page.getByLabel('Hire date').fill(hireDate);
        await page.getByRole('spinbutton', {name:'Salary'}).fill(salary);
        const statusInput=page.getByRole('combobox', {name:'status'});
        await statusInput.selectOption(status);
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
    }
    
    async function deletionHelperFunction(page:Page, employeeName:string, action:'ok' | 'cancel' ):Promise<void>{
        const searchInput = page.getByPlaceholder(/Search by name, email, or job title/i);
        await searchInput.fill(employeeName);
        const targetRow=page.getByRole('row').filter({hasText:employeeName});
        await expect(targetRow).toBeVisible();
        const deleteButton=targetRow.getByRole('button', {name:'Delete'});
        //await expect(deleteButton).toBeVisible();
        page.once('dialog', async dialog=>{
            expect(dialog.type()).toBe('confirm');
            expect(dialog.message()).toBe(`Delete ${employeeName}?`);
            if(action==='ok'){
                await dialog.accept();
                await expect(targetRow).toHaveCount(0);
            }
            else if(action==='cancel'){
                await dialog.dismiss();
                await expect(targetRow).toBeVisible();
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
        await creationHelperFunction(page, 'ali', 'IT', '3', '2026-11-27', '40000', 'active');
        
    });
    test('should delete an employee', async({page})=>{
        await deletionHelperFunction(page, 'Employee-1795758792372', 'ok');
    });
    test('should cancel an employee deletion', async({page})=>{
        await deletionHelperFunction(page, 'Muhammad Ibrahim', 'cancel');
    });
    test('locate and intract with table elements', async({page})=>{

    });

});
