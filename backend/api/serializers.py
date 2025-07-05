from rest_framework import serializers
from .models import User, Business, Investible, Report, Marker
from django.contrib.auth.hashers import make_password


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class BusinessSerializer(serializers.ModelSerializer):
    industry = serializers.ChoiceField(choices=Business.INDUSTRY_CHOICES)

    class Meta:
        model = Business
        fields = [
            'business_id',
            'bsns_name',
            'bsns_address',
            'industry',
            'status',
        ]

class InvestibleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Investible
        fields = '__all__'
        read_only_fields = ['investible_id']
        extra_kwargs = {
            'invst_location': {'required': True},
            'invst_description': {'required': True},
        }

class MarkerSerializer(serializers.ModelSerializer):
    business = BusinessSerializer(read_only=True)
    business_id = serializers.PrimaryKeyRelatedField(
        queryset=Business.objects.all(),
        source='business',
        write_only=True,
        required=False   # ✅ Make this optional
    )

    class Meta:
        model = Marker
        fields = ['marker_id', 'label', 'latitude', 'longitude', 'business', 'business_id']

class ReportSerializer(serializers.ModelSerializer):
    investible = InvestibleSerializer(read_only=True)
    business = BusinessSerializer(read_only=True)
    investible_id = serializers.PrimaryKeyRelatedField(
        queryset=Investible.objects.all(), source='investible', write_only=True
    )
    business_id = serializers.PrimaryKeyRelatedField(
        queryset=Business.objects.all(), source='business', write_only=True
    )

    class Meta:
        model = Report
        fields = ['report_id', 'report_description', 'report_date', 'investible', 
                'business', 'investible_id', 'business_id'
                ]
        read_only_fields = ['report_id']


