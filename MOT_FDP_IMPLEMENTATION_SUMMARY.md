# MOT & FDP Integration Implementation Summary

## Overview
This document summarizes the comprehensive implementation of MOT (Motivo de Modificación) casuísticas and FDP (Formato de Plano) field visibility/requirements integration in ProductEditPage.tsx.

## Components Implemented

### 1. State Management

#### New State Variable
- `inheritedFields: Set<string>` - Tracks fields auto-filled from the base product for modified projects
  - Populated when a modified project is loaded and MOT requires autofill
  - Used to display "Heredado del producto base" badge
  - Used to disable/lock inherited fields

### 2. Configuration Objects

#### FORMAT_FIELD_RULES_BY_FDP
Centralized configuration defining field visibility, requirements, and SI status by FDP:
- `GENERICA`: Lamina format rules
- `TISSUE`: Tissue lamina format rules  
- `FOOD`: Food lamina format rules
- `POUCH_DEFAULT`: Generic POUCH format rules
- `BOLSA_DEFAULT`: Generic BOLSA format rules

Each entry contains:
- `visibleFields: Set<string>` - Fields that should be displayed for this FDP
- `requiredFields: Set<string>` - Fields that must have values
- `siFields: Set<string>` - Fields sent to Sistema Integral

#### SI_FIELDS Constant
Global set of fields always sent to Sistema Integral when applicable.

### 3. Helper Functions

#### MOT-Based Functions
- `getMotRule(mot: string)` - Returns the MOT configuration object
- `isFieldEditableByMot(fieldName: string, mot: string | null)` - Checks if field is in editable groups
- `isFieldLockedByMot(fieldName: string, mot: string | null)` - Checks if field is in locked groups
- `getEnabledSectionsByMot(mot: string | null)` - Returns visible sections for this MOT
- `requiresBaseProductAutofill(mot: string | null)` - Indicates if autofill is needed

#### FDP-Based Functions
- `getFormatRulesByFdp(blueprintFormat: string | null)` - Gets the rule set for a given FDP
- `isFieldVisibleByFormat(fieldName: string, blueprintFormat: string | null)` - FDP visibility check
- `isFieldRequiredByFormat(fieldName: string, blueprintFormat: string | null, mot: string | null)` - FDP requirement check
- `isSiField(fieldName: string, blueprintFormat: string | null)` - Checks if field is SI
- `getVisibleFieldsByFormat(blueprintFormat: string | null)` - Returns all visible fields for FDP
- `getRequiredFieldsByFormat(blueprintFormat: string | null, mot: string | null)` - Returns required fields for FDP

#### Combined Visibility Functions
- `shouldFieldBeVisible(fieldName: string, mot: string | null, blueprintFormat: string | null)` - Unified visibility check (MOT + FDP)
- `shouldFieldBeDisabled(fieldName: string, mot: string | null, inheritedFields: Set<string>)` - Determines if field should be disabled

### 4. UI Components

#### FieldBadges Component
Displays badges for field status:
- "Heredado del producto base" (gray) - Field inherited from base product
- "Campo SI" (blue) - Field sent to Sistema Integral
- "Bloqueado por MOT" (red) - Field locked by current MOT

#### FormInputWithBadges Component
Wrapper component for FormInput that integrates:
- MOT/FDP visibility logic
- Badge display
- Disability state handling
- Automatic badge rendering based on field properties

### 5. Autofill Logic

When a modified project is loaded with a MOT that requires autofill:
1. Check `requiresBaseProductAutofill(mot)`
2. Iterate through form fields
3. For fields NOT in the MOT's editable groups:
   - Copy value from `project.approvedProductSnapshot`
   - Add to `inheritedFields` Set
4. Set form and inheritedFields state

This ensures fields that shouldn't be edited inherit approved values automatically.

### 6. Validation Integration

#### Updated requiredFields Calculation
- Now includes FDP-based required fields via `getRequiredFieldsByFormat()`
- Combines with existing BASE_REQUIRED_FIELDS
- Dependencies include `form.motivoModificacion` and `form.blueprintFormat`

#### shouldValidateField Function
Already integrated to check:
- If field is editable according to MOT
- Only validates fields that can be edited for modified projects

## Implementation Example

### Pattern for Adding Badges to Fields

```typescript
<div>
  <FormInput
    label="Field Label"
    value={form.fieldName}
    onChange={(value) => updateField("fieldName", value)}
    onBlur={() => markFieldAsTouched("fieldName")}
    error={getError("fieldName")}
    disabled={existingDisabledLogic || shouldFieldBeDisabled("fieldName", form.projectType, inheritedFields)}
  />
  <FieldBadges
    isInherited={inheritedFields.has("fieldName")}
    isSiField={isSiField("fieldName", form.blueprintFormat)}
    isLocked={isFieldLockedByMot("fieldName", form.projectType)}
  />
</div>
```

## Integrated Examples in Dimensiones Section
- Width field (line 5014): Demonstrates full integration with badges and disability
- Length field (line 5034): Shows FDP and MOT integration
- Gusset Width field (line 5060): Complete pattern example

## Field Visibility Priority

Fields are shown/hidden based on this priority:
1. Classification (Nuevo vs Modificado)
2. MOT/Casuística (determines editable groups and locked groups)
3. Wrapping Type (inherited from portfolio)
4. FDP Calculation (via guided questions)
5. FDP Rules (FORMAT_FIELD_RULES_BY_FDP)
6. MOT Editability (determines which fields user can modify)

## How to Apply to Remaining Fields

To apply this pattern to other form fields:

1. **For simple fields** (text inputs, selects):
   ```typescript
   disabled={existingLogic || shouldFieldBeDisabled("fieldName", form.projectType, inheritedFields)}
   ```
   Add FieldBadges component after the input.

2. **For conditional visibility**:
   ```typescript
   {shouldFieldBeVisible("fieldName", form.projectType, form.blueprintFormat) && (
     <div>
       {/* field rendering */}
       <FieldBadges {...} />
     </div>
   )}
   ```

3. **For section-level visibility**:
   - Use `getEnabledSectionsByMot()` to check if entire section should show
   - Get enabled sections from MOT rule

## Testing Checklist

- [ ] Modified product loads with inherited fields auto-filled
- [ ] Inherited fields show "Heredado del producto base" badge
- [ ] SI fields show "Campo SI" badge for applicable FDP
- [ ] MOT-locked fields are disabled and show "Bloqueado por MOT" badge
- [ ] FDP-based field visibility works correctly
- [ ] requiredFields includes FDP-based requirements
- [ ] Validation respects field visibility and MOT editability
- [ ] Form save/submit works with inherited and MOT-locked fields
- [ ] Dimension fields show correct badges and restrictions

## Future Enhancements

1. Complete integration of badges across all form fields
2. Section-level visibility based on MOT enabledSections
3. Dynamic field requirement calculation based on actual MOT + FDP
4. Automatic FDP recalculation when MOT changes
5. buildSistemaIntegralProductPayload function using isSiField()
6. Field-level comments/help text that changes based on MOT
