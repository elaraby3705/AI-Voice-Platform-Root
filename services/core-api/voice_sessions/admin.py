from django.contrib import admin
from django.utils.html import format_html
from .models import VoiceSession


@admin.register(VoiceSession)
class VoiceSessionAdmin(admin.ModelAdmin):
    list_display = (
        'session_id',
        'project',
        'user',
        'colored_status',
        'duration_seconds',
        'started_at'
    )

    list_filter = ('status', 'started_at', 'project')
    search_fields = ('session_id', 'user__email', 'project__name')
    readonly_fields = ('id', 'started_at', 'ended_at', 'duration_seconds')

    fieldsets = (
        ('Session Info', {
            'fields': ('id', 'session_id', 'status', 'project', 'user')
        }),
        ('Timing', {
            'fields': ('started_at', 'ended_at', 'duration_seconds')
        }),
        ('AI & Storage', {
            'fields': ('final_transcript', 'audio_url', 'metadata')
        }),
    )


    def colored_status(self, obj):
        if obj.status == 'COMPLETED':
            return format_html('<span style="color: green;">✅ Completed</span>')
        elif obj.status == 'FAILED':
            return format_html('<span style="color: red;">❌ Failed</span>')
        return format_html('<span style="color: orange;">⏳ Active</span>')

    colored_status.short_description = 'Status'
    colored_status.admin_order_field = 'status'