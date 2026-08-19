from django.urls import path

from skills import views

urlpatterns = [
    path("", views.skill_list),
    path("mine", views.my_skills),
    path("mine/<str:name>", views.remove_my_skill),
    path("<str:name>", views.skill_detail),
]
