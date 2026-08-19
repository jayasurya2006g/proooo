from django.urls import path

from jobs import views

urlpatterns = [
    path("", views.job_list),
    path("recommendations", views.recommendations),
    path("next-skills", views.next_skills),
    path("peers", views.peers),
    path("applications", views.my_applications),
    path("companies", views.company_list),
    path("companies/<str:name>/skills", views.company_skills),
    path("<str:job_id>", views.job_detail),
    path("<str:job_id>/apply", views.apply),
]
