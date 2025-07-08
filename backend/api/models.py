from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# USER MANAGER
class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('user_role', 'Admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get('is_superuser') is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(username, email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    
    ROLE_CHOICES = (
        ('Admin', 'Admin'),
        ('Employee', 'Employee'),
    )

    STATUS_CHOICES = (
        ('active', 'Active'),
        ('archive', 'Archive'),
    )

    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)  
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    user_role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='Employee')
    user_status = models.CharField(max_length=8, choices=STATUS_CHOICES, default='active')
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    objects = UserManager()

    def __str__(self):
        return self.username


class Business(models.Model):
    INDUSTRY_CHOICES = (
        ('mall', 'Mall'),
        ('restaurant', 'Restaurant'),
        ('school', 'School'),
        ('hospital', 'Hospital'),
        ('office', 'Office'),
        ('market', 'Market'),
        ('other', 'Other'),
    )

    business_id = models.AutoField(primary_key=True)
    bsns_name = models.CharField(max_length=255)
    bsns_address = models.CharField(max_length=255)

    # ✅ Now industry uses dropdown
    industry = models.CharField(
        max_length=100,
        choices=INDUSTRY_CHOICES,
        default='other'
    )

    status = models.CharField(
        max_length=10,
        choices=(
            ('active', 'Active'),
            ('inactive', 'Inactive'),
            ('pending', 'Pending'),
            ('archived', 'Archived'),
        ),
        default='active'
    )

    def __str__(self):
        return self.bsns_name


# class Meta:
#       db_table = 'tbl_businesses'


class Investible(models.Model):
    INVESTIBLE_STATUS_CHOICES = (
        ('available', 'Available'),
        ('sold', 'Sold'),
        ('pending', 'Pending'),
    )
    investible_id = models.AutoField(primary_key=True)
    invst_location = models.CharField(max_length=255)
    invst_description = models.CharField(max_length=255)
    status = models.CharField(max_length=10, choices=INVESTIBLE_STATUS_CHOICES, default='available')

# class Meta:
#       db_table = 'tbl_investibles'


class Marker(models.Model):
    marker_id = models.AutoField(primary_key=True, default=None)
    label = models.CharField(max_length=100)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='business_markers', null=True, blank=False)
    invst = models.ForeignKey(Investible, on_delete=models.CASCADE, related_name='investment_markers', null=True, blank=False)
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        return self.label

# class Meta:
#     db_table = 'tbl_markers'

class Report(models.Model):
    report_id = models.AutoField(primary_key=True)
    report_description = models.TextField()
    report_date = models.DateTimeField(auto_now_add=True)
    investible = models.ForeignKey(Investible, on_delete=models.CASCADE, related_name='reports', null=True, blank=False)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='reports', null=True, blank=False)


# class Meta:
#       db_table = 'tbl_reports'