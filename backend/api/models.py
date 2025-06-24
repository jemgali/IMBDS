from django.db import models

class User(models.Model):

    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('investor', 'Investor'),
        ('employee', 'Employee'),
    )

    STATUS_CHOICES = (
        ('online', 'Online'),
        ('offline', 'Offline'),
        ('archive', 'Archive'),
    )


    user_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    user_role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    user_status = models.CharField(max_length=8, choices=STATUS_CHOICES, default='online')

    def __str__(self):
        return self.username

class Business(models.Model):

    business_status = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('pending', 'Pending'),
        ('archived', 'Archived'),
    )
    business_id = models.AutoField(primary_key=True)
    bsns_name = models.CharField(max_length=255)
    bsns_address = models.CharField(max_length=255)
    industry = models.CharField(max_length=100)
    status = models.CharField(max_length=10, choices=business_status, default='active')

    def __str__(self):
        return self.bsns_name   

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

class Location(models.Model):
    location_id = models.AutoField(primary_key=True)
    bsns = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='businesses')
    invst = models.ForeignKey(Investible, on_delete=models.CASCADE, related_name='investments')
    loc_name = models.CharField(max_length=255)
    loc_address = models.CharField(max_length=255)
    loc_type = models.CharField(max_length=50)

    def __str__(self):
        return self.loc_name
