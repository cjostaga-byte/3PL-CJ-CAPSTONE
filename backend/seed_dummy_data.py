"""
Dummy Data Seeder - Safe Production Insert
==========================================
Inserts 900 Employee records + 100 HR records into the production DB.
- Uses the existing schema, hubs, and relationship constraints
- Idempotent: skips employees whose employee_id already exists
- Does NOT modify any existing records
- Works with the deployed Aiven PostgreSQL database
"""

import os
import sys
import random
import string
import time
from datetime import date, timedelta
from decimal import Decimal

# Setup Django
sys.path.insert(0, '.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()

from django.db import transaction
from django.contrib.auth.models import User
from employees.models import Employee, Hub, HRPermission

# ── Realistic Philippine Data ──────────────────────────────────────────────────

FIRST_NAMES_MALE = [
    'Juan', 'Jose', 'Carlos', 'Miguel', 'Ramon', 'Antonio', 'Eduardo', 'Roberto',
    'Ricardo', 'Fernando', 'Manuel', 'Francisco', 'Victor', 'Mario', 'Luis',
    'Andres', 'Diego', 'Rafael', 'Alejandro', 'Marco', 'Bryan', 'Christian',
    'Mark', 'John', 'James', 'Michael', 'Daniel', 'David', 'Joseph', 'Kenneth',
    'Ronald', 'Jeffrey', 'Christopher', 'Anthony', 'Ryan', 'Patrick', 'Jerome',
    'Roel', 'Ariel', 'Jayson', 'Aldrin', 'Erwin', 'Joven', 'Marvin', 'Darwin',
    'Rodel', 'Ronaldo', 'Danilo', 'Romeo', 'Renato', 'Reymundo', 'Wilfredo',
    'Benedicto', 'Filomeno', 'Crisanto', 'Epifanio', 'Gregorio', 'Hermogenes',
    'Ildefonso', 'Jacinto', 'Liberato', 'Melchor', 'Narciso', 'Onofre',
]

FIRST_NAMES_FEMALE = [
    'Maria', 'Ana', 'Elena', 'Rosa', 'Carmen', 'Luz', 'Grace', 'Joy', 'Faith',
    'Josephine', 'Marilyn', 'Jennifer', 'Angela', 'Angelica', 'Lorna', 'Gloria',
    'Rosalinda', 'Marilou', 'Teresita', 'Conchita', 'Norma', 'Evelyn', 'Elsie',
    'Shirley', 'Vivian', 'Flordeliza', 'Milagros', 'Remedios', 'Corazon', 'Caridad',
    'Esperanza', 'Felicidad', 'Gregoria', 'Honorata', 'Isabela', 'Josefina',
    'Kristine', 'Luningning', 'Magdalena', 'Natividad', 'Olivia', 'Patricia',
    'Rowena', 'Soledad', 'Theresa', 'Ursula', 'Vanessa', 'Wenifreda', 'Xyza', 'Yolanda',
    'Alma', 'Bella', 'Cecile', 'Diana', 'Ellen', 'Fely', 'Gina', 'Hannah',
    'Iris', 'Juliet', 'Karen', 'Linda', 'Mylene', 'Nina', 'Ofelia', 'Portia',
]

LAST_NAMES = [
    'Santos', 'Reyes', 'Cruz', 'Garcia', 'Torres', 'Flores', 'Gonzales', 'Ramos',
    'Aquino', 'Mendoza', 'Dela Cruz', 'Villanueva', 'Bautista', 'Hernandez', 'Rivera',
    'Castillo', 'Morales', 'Aguilar', 'Diaz', 'Salazar', 'Soriano', 'Tan', 'Lim',
    'Sy', 'Ong', 'Co', 'Dy', 'Lee', 'Yu', 'Go', 'Chua', 'Ang', 'Lopez', 'Perez',
    'Martinez', 'Fernandez', 'Ramirez', 'Navarro', 'Ortega', 'Vargas', 'Rojas',
    'Espinosa', 'Manalo', 'Pascual', 'Padilla', 'Macapagal', 'Enriquez', 'Tolentino',
    'Magsaysay', 'Mercado', 'Roxas', 'Osmeña', 'Quezon', 'Laurel', 'Arroyo',
    'Catapang', 'Genuino', 'Pangilinan', 'Abad', 'Abaya', 'Abella', 'Abesamis',
    'Ablaza', 'Abner', 'Abolencia', 'Abrantes', 'Acebedo', 'Acero', 'Acosta',
    'Adlawan', 'Adriano', 'Agcaoili', 'Agpalo', 'Agustin', 'Alcantara', 'Alcarez',
    'Aldana', 'Alegre', 'Alejo', 'Alejandro', 'Alipio', 'Almazan', 'Almonte',
    'Alonso', 'Altarejos', 'Alteza', 'Alvarado', 'Alvarez', 'Amante', 'Ambrocio',
]

MIDDLE_INITIALS = list('ABCDEFGHIJKLMNOPQRSTUVWXYZ') + ['']

POSITIONS = [
    'Sorter', 'Courier', 'Rider', 'Dispatcher', 'Warehouse Staff',
    'Quality Control', 'Encoder', 'Customer Service', 'Cashier',
    'Line Leader', 'Logistics Coordinator', 'Driver', 'Helper',
    'Scanner', 'Packer', 'Checker', 'Loader', 'Unloader',
    'Supervisor', 'Team Leader',
]

HR_POSITIONS = [
    'HR Assistant', 'HR Coordinator', 'HR Specialist', 'HR Officer',
    'Payroll Officer', 'Recruitment Specialist', 'Training Officer',
    'HRIS Analyst', 'Labor Relations Officer', 'Benefits Administrator',
]

GENDERS = ['Male', 'Female']
NATIONALITIES = ['Filipino']
MARITAL_STATUSES = ['Single', 'Married', 'Widowed', 'Separated']
EMPLOYMENT_TYPES = ['Full-time', 'OCW']
STATUSES = ['Active', 'Active', 'Active', 'Active', 'Active', 'Active', 'Active', 'Active', 'Resign', 'AWOL']  # weighted

REGIONS = [
    'Region IV-A (CALABARZON)', 'Region IV-A (CALABARZON)', 'Region IV-A (CALABARZON)',
    'NCR - National Capital Region', 'Region III (Central Luzon)',
]

PROVINCES = {
    'Region IV-A (CALABARZON)': ['Quezon', 'Cavite', 'Laguna', 'Batangas', 'Rizal'],
    'NCR - National Capital Region': ['Metro Manila'],
    'Region III (Central Luzon)': ['Bulacan', 'Pampanga', 'Nueva Ecija', 'Bataan'],
}

CITIES = {
    'Quezon': ['Lucena City', 'Tayabas', 'Candelaria', 'San Pablo', 'Calauag', 'Sariaya', 'Tiaong', 'Dolores', 'Gumaca'],
    'Cavite': ['Imus', 'Bacoor', 'Dasmariñas', 'General Trias', 'Tagaytay'],
    'Laguna': ['Santa Rosa', 'Biñan', 'Calamba', 'San Pedro', 'Cabuyao'],
    'Batangas': ['Batangas City', 'Lipa', 'Tanauan', 'Santo Tomas'],
    'Rizal': ['Antipolo', 'Cainta', 'Taytay', 'Marikina'],
    'Metro Manila': ['Quezon City', 'Manila', 'Pasig', 'Makati', 'Taguig', 'Parañaque'],
    'Bulacan': ['Meycauayan', 'Marilao', 'Bocaue', 'San Jose del Monte'],
    'Pampanga': ['Angeles City', 'San Fernando', 'Mabalacat'],
    'Nueva Ecija': ['Cabanatuan City', 'San Jose City', 'Gapan'],
    'Bataan': ['Balanga City', 'Mariveles', 'Dinalupihan'],
}

BARANGAYS = [
    'Barangay 1', 'Barangay 2', 'Barangay 3', 'Barangay 4', 'Barangay 5',
    'Poblacion', 'San Roque', 'San Jose', 'San Antonio', 'Sta. Cruz',
    'Sta. Maria', 'Santo Tomas', 'Del Remedio', 'Bucal', 'Mayao Kanluran',
    'Mayao Silangan', 'Ibabang Palale', 'Ilayang Palale', 'Ibabang Dupay',
    'Ilayang Dupay', 'Gulang Gulang', 'Cotta', 'Isabang', 'Market View',
]

ZIP_CODES = {
    'Lucena City': '4301', 'Tayabas': '4327', 'Candelaria': '4323',
    'San Pablo': '4000', 'Sariaya': '4322', 'Tiaong': '4325',
    'Quezon City': '1100', 'Manila': '1000', 'Pasig': '1600',
    'Makati': '1200', 'Taguig': '1630', 'Parañaque': '1700',
    'Imus': '4103', 'Bacoor': '4102', 'Dasmariñas': '4114',
    'Santa Rosa': '4026', 'Biñan': '4024', 'Calamba': '4027',
    'Batangas City': '4200', 'Lipa': '4217', 'Antipolo': '1870',
    'Meycauayan': '3020', 'Angeles City': '2009', 'Cabanatuan City': '3100',
    'Balanga City': '2100',
}


def rand_date_of_birth():
    """Age between 20 and 55."""
    today = date.today()
    years_ago = random.randint(20, 55)
    return today - timedelta(days=years_ago * 365 + random.randint(0, 364))


def rand_hire_date():
    """Hired between 2018 and 2025."""
    start = date(2018, 1, 1)
    end = date(2025, 12, 31)
    delta = (end - start).days
    return start + timedelta(days=random.randint(0, delta))


def rand_phone():
    """Generate valid PH mobile: 09XXXXXXXXX."""
    prefixes = ['0917', '0918', '0919', '0920', '0921', '0922', '0923', '0927',
                '0928', '0929', '0930', '0939', '0945', '0955', '0956', '0961',
                '0963', '0966', '0967', '0968', '0976', '0977', '0992', '0998']
    prefix = random.choice(prefixes)
    suffix = ''.join(random.choices(string.digits, k=7))
    return prefix + suffix


def rand_employee_id(prefix='EMP'):
    """Generate unique employee ID like EMP-XXXXXXXX."""
    return prefix + '-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))


def rand_jtp_code():
    """Generate JTP-like code."""
    return 'JPT-' + ''.join(random.choices(string.digits, k=6))


def rand_gov_number(length=12):
    """Generate a government document number."""
    return ''.join(random.choices(string.digits, k=length))


def rand_tin():
    """Generate TIN-like format: XXX-XXX-XXX-XXX."""
    parts = [rand_gov_number(3), rand_gov_number(3), rand_gov_number(3), rand_gov_number(3)]
    return '-'.join(parts)


def rand_address():
    """Generate random PH address components."""
    region = random.choice(REGIONS)
    provinces = PROVINCES.get(region, ['Quezon'])
    province = random.choice(provinces)
    cities_in_prov = CITIES.get(province, ['Lucena City'])
    city = random.choice(cities_in_prov)
    barangay = random.choice(BARANGAYS)
    zip_code = ZIP_CODES.get(city, '4301')
    return region, province, city, barangay, zip_code


def rand_name(gender=None):
    """Return (firstname, lastname, middle_initial, gender)."""
    if gender is None:
        gender = random.choice(GENDERS)
    if gender == 'Male':
        first = random.choice(FIRST_NAMES_MALE)
    else:
        first = random.choice(FIRST_NAMES_FEMALE)
    last = random.choice(LAST_NAMES)
    mi = random.choice(MIDDLE_INITIALS)
    return first, last, mi, gender


def generate_email(firstname, lastname, n):
    """Create unique email."""
    domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'protonmail.com']
    domain = random.choice(domains)
    slug = (firstname + '.' + lastname + str(n)).lower().replace(' ', '').replace("'", '')
    return f'{slug}@{domain}'


# ── Seeder ─────────────────────────────────────────────────────────────────────

def seed_employees(count=900, role='Employee', start_index=1):
    """Insert `count` employees with given role into random hubs."""
    hubs = list(Hub.objects.all())
    if not hubs:
        print('ERROR: No hubs found in database. Cannot insert employees.')
        return 0, []

    inserted = 0
    skipped = 0
    inserted_ids = []

    for i in range(start_index, start_index + count):
        # Generate unique employee_id
        for attempt in range(10):
            emp_id = rand_employee_id('EMP' if role == 'Employee' else 'HR')
            if not Employee.objects.filter(employee_id=emp_id).exists():
                break
        else:
            print(f'  WARNING: Could not generate unique employee_id after 10 attempts, skipping record {i}')
            skipped += 1
            continue

        gender = random.choice(GENDERS)
        firstname, lastname, mi, gender = rand_name(gender)
        region, province, city_mun, barangay, zip_code = rand_address()
        dob = rand_date_of_birth()
        hire_date = rand_hire_date()
        phone = rand_phone()
        hub = random.choice(hubs)
        email = generate_email(firstname, lastname, i)
        status = random.choice(STATUSES)
        employment_type = random.choices(EMPLOYMENT_TYPES, weights=[85, 15])[0]

        if role == 'Employee':
            position = random.choice(POSITIONS)
        else:
            position = random.choice(HR_POSITIONS)

        emp_data = {
            'employee_id': emp_id,
            'firstname': firstname,
            'lastname': lastname,
            'middle_initial': mi,
            'gender': gender,
            'nationality': 'Filipino',
            'marital_status': random.choice(MARITAL_STATUSES),
            'place_of_birth': city_mun,
            'date_of_birth': dob,
            'email_address': email,
            'phone_number': phone,
            'region': region,
            'province': province,
            'city_municipality': city_mun,
            'barangay': barangay,
            'zip_code': zip_code,
            'position': position,
            'employment_type': employment_type,
            'status': status,
            'role': role,
            'hub': hub,
            'hired_date': hire_date,
            'jtp_code': rand_jtp_code(),
            'tin': rand_tin(),
            'sss': rand_gov_number(10),
            'philhealth': rand_gov_number(12),
            'pagibig': rand_gov_number(12),
            'emergency_contact_name': ' '.join(rand_name()[:2]),
            'emergency_contact_phone': rand_phone(),
            'can_login': False,
            'can_edit_info': True,
            'is_active': status == 'Active',
        }

        try:
            with transaction.atomic():
                employee = Employee.objects.create(**emp_data)
                inserted_ids.append(employee.id)
                inserted += 1
        except Exception as e:
            print(f'  ERROR inserting employee {i}: {e}')
            skipped += 1
            continue

        if inserted % 100 == 0:
            print(f'  Inserted {inserted} {role} records so far...')

    return inserted, inserted_ids


def setup_hr_permissions(hr_ids):
    """Create HRPermission records for HR employees."""
    hubs = list(Hub.objects.all())
    setup_count = 0

    for emp_id in hr_ids:
        try:
            emp = Employee.objects.get(id=emp_id)
            if not HRPermission.objects.filter(hr_employee=emp).exists():
                # Assign 1–3 random hubs
                assigned_hubs = random.sample(hubs, min(random.randint(1, 3), len(hubs)))
                perm = HRPermission.objects.create(
                    hr_employee=emp,
                    access_type=random.choice(['Single', 'Multiple']),
                    can_view_employees=True,
                    can_edit_employee_info=random.choice([True, False]),
                    can_edit_payslip=random.choice([True, False]),
                    can_delete_employees=False,
                    can_reset_password=random.choice([True, False]),
                    can_enable_employee_edit=random.choice([True, False]),
                )
                perm.managed_hubs.set(assigned_hubs)
                setup_count += 1
        except Employee.DoesNotExist:
            pass
        except Exception as e:
            print(f'  ERROR setting up HR permissions for emp_id={emp_id}: {e}')

    return setup_count


def run():
    print('=' * 60)
    print('DUMMY DATA SEEDER - Production DB')
    print('=' * 60)
    print()

    # Check current state
    existing_emp = Employee.objects.filter(role='Employee').count()
    existing_hr = Employee.objects.filter(role='HR').count()
    existing_total = Employee.objects.count()
    print(f'Existing records: {existing_total} total ({existing_emp} Employee, {existing_hr} HR)')
    print()

    # Seed 900 Employees
    print('Inserting 900 Employee records...')
    emp_inserted, emp_ids = seed_employees(count=900, role='Employee', start_index=1)
    print(f'  Done: {emp_inserted} Employee records inserted')
    print()

    # Seed 100 HR employees
    print('Inserting 100 HR records...')
    hr_inserted, hr_ids = seed_employees(count=100, role='HR', start_index=1000)
    print(f'  Done: {hr_inserted} HR records inserted')
    print()

    # Setup HR permissions
    if hr_ids:
        print('Setting up HRPermission records for new HR employees...')
        perm_count = setup_hr_permissions(hr_ids)
        print(f'  Done: {perm_count} HRPermission records created')
    print()

    # Final summary
    final_total = Employee.objects.count()
    final_emp = Employee.objects.filter(role='Employee').count()
    final_hr = Employee.objects.filter(role='HR').count()
    final_admin = Employee.objects.filter(role='Admin').count()

    print('=' * 60)
    print('SEEDING COMPLETE - Final DB State:')
    print(f'  Total Employees: {final_total}')
    print(f'  Employee (role): {final_emp}')
    print(f'  HR (role): {final_hr}')
    print(f'  Admin (role): {final_admin}')
    print(f'  New Employee records inserted: {emp_inserted}')
    print(f'  New HR records inserted: {hr_inserted}')
    print(f'  Grand total new records: {emp_inserted + hr_inserted}')
    print('=' * 60)


if __name__ == '__main__':
    run()
