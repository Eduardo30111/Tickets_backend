from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    EquipoViewSet,
    TicketViewSet,
    UsuarioViewSet,
    auth_login,
    solicitar,
    stats,
)

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'equipos', EquipoViewSet)
router.register(r'tickets', TicketViewSet)

urlpatterns = router.urls + [
    path('stats/', stats, name='api-stats'),
    path('solicitar-ticket/', solicitar, name='api-solicitar'),
    path('auth/login/', auth_login, name='api-auth-login'),
]
