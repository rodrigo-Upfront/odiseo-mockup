# Estandarización UI/UX - ODISEO Portal

## Estado Actual

### ✅ Componentes Base Creados
1. **PageLayout** - Wrapper con fondo `#f6f8fb`
2. **PageHeader** - Encabezado con título, subtítulo, botón atrás, acciones
3. **BackButton** - Botón reutilizable para navegación hacia atrás
4. **SectionCard** - Tarjeta para agrupar contenido
5. **EmptyState** - Estado vacío con variantes (search, no-data, error)
6. **DataTable** - Tabla genérica con columnas configurables
7. **TableFooterPagination** - Pie de tabla con paginación dinámica
8. **ActionButton** - Botones con variantes (primary, secondary, danger, success, outline)
9. **StatusBadge** - Badges de estado con múltiples variantes
10. **ModuleBreadcrumb** - Navegación breadcrumb

### ✅ Páginas Refactorizadas

#### List Pages
- **ClientListPage** ✅ - Implementación de referencia
- **ChecksListPage** ✅

#### Detail Pages
- **ClientDetailPage** ✅ - Patrón establecido

#### Pages Pending Refactoring
- **ClientCreatePage** - Crear cliente
- **ClientEditPage** - Editar cliente
- **UserCreatePage** - Crear usuario
- **UserEditPage** - Editar usuario
- **ProjectDetailPage** - Detalle proyecto
- **ProjectCreatePage** - Crear proyecto
- **ProjectEditPage** - Editar proyecto
- **PortfolioDetailPage** - Detalle portafolio
- **PortfolioCreatePage** - Crear portafolio
- **PortfolioEditPage** - Editar portafolio
- **ValidationDetailPage** - Detalle validación
- **DataSheetEditPage** - Editar ficha producto

## Patrones Establecidos

### List Page Pattern (Reference: ClientListPage)
```tsx
<PageLayout>
  <PageHeader
    title="Módulo Title"
    subtitle="Descripción"
    showBackButton={false} // Never on list pages
  />
  <div className="space-y-6 p-6">
    {/* Summary Cards */}
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      {/* Stats cards */}
    </section>

    {/* Tabs & Status Summary */}
    <SectionCard title="Estado">
      {/* Tab navigation */}
    </SectionCard>

    {/* Filters */}
    <SectionCard title="Filtros">
      {/* Filter controls */}
    </SectionCard>

    {/* Table */}
    <SectionCard title="Listado" noPadding>
      {/* Table content */}
      <TableFooterPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalRecords}
        itemsPerPage={pageSize}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setPageSize}
      />
    </SectionCard>
  </div>
</PageLayout>
```

### Detail Page Pattern (Reference: ClientDetailPage)
```tsx
<PageLayout>
  <PageHeader
    title={recordCode}
    subtitle={recordName}
    showBackButton
    backPath="/module-path"
    actions={
      <ActionButton
        label="Editar"
        onClick={() => navigate(`/edit/${id}`)}
        variant="primary"
        icon={<Edit size={16} />}
      />
    }
  />
  <div className="space-y-6 p-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <SectionCard title="Resumen">
          {/* Quick info */}
        </SectionCard>
      </div>
      <div className="md:col-span-2">
        <SectionCard title="Información">
          {/* Detailed info */}
        </SectionCard>
      </div>
    </div>
  </div>
</PageLayout>
```

### Create/Edit Page Pattern
```tsx
<PageLayout>
  <PageHeader
    title="Crear/Editar [Entity]"
    subtitle="Descripción del formulario"
    showBackButton
    backPath="/module-path"
  />
  <div className="space-y-6 p-6">
    <form onSubmit={handleSubmit}>
      <SectionCard title="Sección 1">
        {/* Form fields */}
      </SectionCard>

      <SectionCard title="Sección 2">
        {/* More form fields */}
      </SectionCard>

      <div className="flex gap-3 justify-end">
        <ActionButton
          label="Cancelar"
          onClick={() => navigate(-1)}
          variant="outline"
        />
        <ActionButton
          label="Guardar"
          type="submit"
          variant="primary"
        />
      </div>
    </form>
  </div>
</PageLayout>
```

## Cambios Requeridos por Página

### ClientCreatePage / ClientEditPage
- [ ] Reemplazar useLayout() con PageLayout
- [ ] Agregar PageHeader con back button
- [ ] Envolver formulario en SectionCard por sección
- [ ] Reemplazar botones con ActionButton
- [ ] Mantener validaciones existentes

### UserCreatePage / UserEditPage
- [ ] Mismo patrón que ClientCreatePage
- [ ] Mantener selección de vendedor SI
- [ ] Validación de email única

### ProjectDetailPage / ProjectCreatePage / ProjectEditPage
- [ ] Aplicar patrón detail/create/edit
- [ ] Mostrar estado validación si aplica
- [ ] Mantener toda lógica de proyectos

### PortfolioDetailPage / PortfolioCreatePage / PortfolioEditPage
- [ ] Aplicar patrón
- [ ] Mantener contexto de cliente/planta

### ValidationDetailPage
- [ ] Refactorizar con PageLayout
- [ ] Mantener interfaz de validación por área
- [ ] Usar ActionButton para botones de acción

## Checklist de Implementación

### Fase 1: Clientes (✅ 50% complete)
- [x] ClientListPage
- [x] ClientDetailPage
- [ ] ClientCreatePage
- [ ] ClientEditPage

### Fase 2: Usuarios
- [ ] UserListPage (buscar si existe)
- [ ] UserCreatePage
- [ ] UserEditPage

### Fase 3: Proyectos
- [ ] ProjectListPage
- [ ] ProjectDetailPage
- [ ] ProjectCreatePage
- [ ] ProjectEditPage

### Fase 4: Validaciones
- [ ] ChecksListPage (✅ done, rename from ValidationListPage)
- [ ] ChecksDetailPage / ValidationDetailPage

### Fase 5: Portafolio & Fichas
- [ ] PortfolioListPage / PortfolioDetailPage / PortfolioCreatePage / PortfolioEditPage
- [ ] DataSheetEditPage

## Color & Estilo Standard

- **Primario**: `#003b5c`
- **Secundario**: `#005f7f`
- **Fondo General**: `#f8fafc` o `#f6f8fb`
- **Background Cards**: `white`
- **Border**: `border-slate-200`
- **Shadow**: `shadow-sm`

## Imports Base para Nuevas Refactorizaciones

```tsx
import PageLayout from "../../../shared/components/layout/PageLayout";
import PageHeader from "../../../shared/components/layout/PageHeader";
import SectionCard from "../../../shared/components/cards/SectionCard";
import ActionButton from "../../../shared/components/buttons/ActionButton";
import BackButton from "../../../shared/components/buttons/BackButton";
import StatusBadge from "../../../shared/components/display/StatusBadge";
import EmptyState from "../../../shared/components/display/EmptyState";
import TableFooterPagination from "../../../shared/components/table/TableFooterPagination";
```

## Notas Importantes

1. **No eliminar funcionalidad**: Mantener toda lógica de filtros, validaciones y datos
2. **Reusable components first**: Usar los 10 componentes creados
3. **Remover LayoutContext**: Reemplazar con PageHeader/PageLayout
4. **BackButton fallback**: Proporcionar `fallbackPath` para cada módulo
5. **Responsive design**: Mantener grid layout para desktop/mobile
6. **Badges consistency**: Usar StatusBadge para estados visuales
7. **Buttons consistency**: Usar ActionButton para todas las acciones

## Próximos Pasos

1. Refactorizar ClientCreatePage / ClientEditPage
2. Continuar con UserCreatePage / UserEditPage
3. Aplicar a ProjectDetailPage
4. Completar todas las pages de create/edit
5. Validar consistencia visual en todos los módulos
