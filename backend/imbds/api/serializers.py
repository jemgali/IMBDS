from rest_framework import serializers
from rest_framework import generics
from .models import User, Business, Investible, Location

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'user_id', 'username', 'first_name', 'last_name',
            'email', 'user_role', 'user_status'
        ]
# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = '__all__'
#         read_only_fields = ['user_id']
#         extra_kwargs = {
#             'password': {'write_only': True}
#         }
#     def create(self, validated_data):
#         user = User.objects.create(**validated_data)
#         return user

class BusinessSerializer(serializers.ModelSerializer):
    class Meta:
        model = Business
        fields = '__all__'
        read_only_fields = ['business_id']
        extra_kwargs = {
            'bsns_name': {'required': True},
            'bsns_address': {'required': True},
            'industry': {'required': True},
        }

class InvestibleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Investible
        fields = '__all__'
        read_only_fields = ['investible_id']
        extra_kwargs = {
            'invst_location': {'required': True},
            'invst_description': {'required': True},
        }

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'
        read_only_fields = ['location_id']
        extra_kwargs = {
            'bsns': {'required': True},
            'invst': {'required': True},
            'loc_name': {'required': True},
            'loc_address': {'required': True},
            'loc_type': {'required': True}
        }

class LocationDetailSerializer(serializers.ModelSerializer):
    bsns = serializers.SerializerMethodField()
    invst = serializers.SerializerMethodField()

    class Meta:
        model = Location
        fields = '__all__'
        read_only_fields = ['location_id']

    def get_bsns(self, obj):
        return BusinessSerializer(obj.bsns).data

    def get_invst(self, obj):
        return InvestibleSerializer(obj.invst).data

        