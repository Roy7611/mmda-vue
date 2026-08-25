import type { UiLogic, UiLogicInit } from '@mmda/vui'
import { AddressLogic } from '../modules/addresses/AddressLogic'
import { AttachmentLogic } from '../modules/attachments/AttachmentLogic'
import { BankLogic } from '../modules/banks/BankLogic'
import { CapitalLogic } from '../modules/capitals/CapitalLogic'
import { CarrierLogic } from '../modules/carriers/CarrierLogic'
import { CarrierCatalogLogic } from '../modules/carrier_catalogs/CarrierCatalogLogic'
import { CarrierNProdLogic } from '../modules/carrier_n_prods/CarrierNProdLogic'
import { CarrierProductLogic } from '../modules/carrier_products/CarrierProductLogic'
import { ClientAppLogic } from '../modules/client_apps/ClientAppLogic'
import { ClientAppModuleLogic } from '../modules/client_app_modules/ClientAppModuleLogic'
import { ClientAppReleaseLogic } from '../modules/client_app_releases/ClientAppReleaseLogic'
import { CodeRuleLogic } from '../modules/code_rules/CodeRuleLogic'
import { ContactorLogic } from '../modules/contactors/ContactorLogic'
import { ContractTemplateLogic } from '../modules/contract_templates/ContractTemplateLogic'
import { CountryLogic } from '../modules/countries/CountryLogic'
import { CurrencyUnitLogic } from '../modules/currency_units/CurrencyUnitLogic'
import { DepartmentLogic } from '../modules/departments/DepartmentLogic'
import { EmployeeLogic } from '../modules/employees/EmployeeLogic'
import { FeedbackLogic } from '../modules/feedbacks/FeedbackLogic'
import { FlowTrailLogic } from '../modules/flow_trails/FlowTrailLogic'
import { HolidayLogic } from '../modules/holidays/HolidayLogic'
import { LabelTemplateLogic } from '../modules/label_templates/LabelTemplateLogic'
import { MaterialCatLogic } from '../modules/materialCats/MaterialCatLogic'
import { MaterialLogic } from '../modules/materials/MaterialLogic'
import { MaterialNSkuLogic } from '../modules/material_n_skus/MaterialNSkuLogic'
import { MaterialPackageLogic } from '../modules/material_packages/MaterialPackageLogic'
import { ModuleAuditTrailLogic } from '../modules/module_audit_trails/ModuleAuditTrailLogic'
import { ModuleBgTaskLogic } from '../modules/module_bg_tasks/ModuleBgTaskLogic'
import { NoticeLogic } from '../modules/notices/NoticeLogic'
import { NotificationLogic } from '../modules/notifications/NotificationLogic'
import { OrganizationUnitLogic } from '../modules/organization_units/OrganizationUnitLogic'
import { PartnerLogic } from '../modules/partners/PartnerLogic'
import { PaymentMethodLogic } from '../modules/payment_methods/PaymentMethodLogic'
import { PersonLogic } from '../modules/persons/PersonLogic'
import { ProvinceNCityLogic } from '../modules/province_n_cities/ProvinceNCityLogic'
import { QualityStandardLogic } from '../modules/quality_standards/QualityStandardLogic'
import { RegionLogic } from '../modules/regions/RegionLogic'
import { RoleLogic } from '../modules/roles/RoleLogic'
import { SkuLogic } from '../modules/skus/SkuLogic'
import { TenantLogic } from '../modules/tenants/TenantLogic'
import { TrashLogic } from '../modules/trashes/TrashLogic'
import { UnitLogic } from '../modules/units/UnitLogic'
import { UserLogic } from '../modules/users/UserLogic'

export const LOGIC_CTORS: Record<string, new (init: UiLogicInit) => UiLogic<any>> = {
  Addresses: AddressLogic,
  Attachments: AttachmentLogic,
  Banks: BankLogic,
  Capitals: CapitalLogic,
  Carriers: CarrierLogic,
  CarrierCatalogs: CarrierCatalogLogic,
  CarrierNProds: CarrierNProdLogic,
  CarrierProducts: CarrierProductLogic,
  ClientApps: ClientAppLogic,
  ClientAppModules: ClientAppModuleLogic,
  ClientAppReleases: ClientAppReleaseLogic,
  CodeRules: CodeRuleLogic,
  Contactors: ContactorLogic,
  ContractTemplates: ContractTemplateLogic,
  Countries: CountryLogic,
  CurrencyUnits: CurrencyUnitLogic,
  Departments: DepartmentLogic,
  Employees: EmployeeLogic,
  Feedbacks: FeedbackLogic,
  FlowTrails: FlowTrailLogic,
  Holidays: HolidayLogic,
  LabelTemplates: LabelTemplateLogic,
  MaterialCats: MaterialCatLogic,
  Materials: MaterialLogic,
  MaterialNSkus: MaterialNSkuLogic,
  MaterialPackages: MaterialPackageLogic,
  ModuleAuditTrails: ModuleAuditTrailLogic,
  ModuleBgTasks: ModuleBgTaskLogic,
  Notices: NoticeLogic,
  Notifications: NotificationLogic,
  OrganizationUnits: OrganizationUnitLogic,
  Partners: PartnerLogic,
  PaymentMethods: PaymentMethodLogic,
  Persons: PersonLogic,
  ProvinceNCities: ProvinceNCityLogic,
  QualityStandards: QualityStandardLogic,
  Regions: RegionLogic,
  Roles: RoleLogic,
  Skus: SkuLogic,
  Tenants: TenantLogic,
  Trashes: TrashLogic,
  Units: UnitLogic,
  Users: UserLogic,
}

export function createRepositoryLogic(repository: string, init: UiLogicInit) {
  const Ctor = LOGIC_CTORS[repository]
  return Ctor ? new Ctor(init) : undefined
}
