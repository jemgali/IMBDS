from django.db import models

class User(models.Model):

    ROLE_CHOICES = (
        ('admin', 'Admin'),
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
    password = models.CharField(max_length=128, default='password')  
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    user_role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    user_status = models.CharField(max_length=8, choices=STATUS_CHOICES, default='online')

    def __str__(self):
        return self.username

# class Meta:
#       db_table = 'tbl_users'


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