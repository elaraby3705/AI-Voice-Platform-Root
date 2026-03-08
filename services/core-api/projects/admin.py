from django.contrib import admin
from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    # 1. Columns displayed in the list view
    list_display = (
        'name', 'status', 'priority', 'risk_level',
        'completion_percentage', 'owner', 'created_at'
    )

    # 2. Sidebar filters for quick sorting
    list_filter = ('status', 'priority', 'risk_level', 'is_archived', 'created_at')

    # 3. Searchable fields
    search_fields = ('name', 'description', 'owner__email', 'manager__email')

    # 4. System-managed fields that shouldn't be edited manually
    readonly_fields = ('id', 'created_at', 'updated_at')

    # 5. Auto-fill the slug field based on the project name in the UI
    prepopulated_fields = {'slug': ('name',)}

    # 6. Better UI for ManyToMany fields (Team members)
    filter_horizontal = ('team',)

    # 7. Organized layout for the project detail page
    fieldsets = (
        ('Core Information', {
            'fields': ('id', 'name', 'slug', 'description', 'is_archived')
        }),
        ('Classification & Status', {
            'fields': ('status', 'priority')
        }),
        ('AI & Analytics Layer', {
            'classes': ('collapse',),  # Makes this section collapsible
            'fields': ('ai_summary', 'completion_percentage', 'risk_level', 'tags')
        }),
        ('Team & Relationships', {
            'fields': ('owner', 'manager', 'team')
        }),
        ('Financials & Resources', {
            'classes': ('collapse',),
            'fields': ('allocated_budget', 'spent_budget', 'estimated_hours')
        }),
        ('Timeline', {
            'fields': ('start_date', 'target_end_date', 'actual_end_date', 'created_at', 'updated_at')
        }),
    )