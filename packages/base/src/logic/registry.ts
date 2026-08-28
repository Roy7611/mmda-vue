import type { UiLogic, UiLogicInit } from '@mmda/vui'

type LogicCtor = new (init: UiLogicInit) => UiLogic<any>
type LogicLoader = () => Promise<LogicCtor>
const logic = <M>(load: () => Promise<M>, name: keyof M): LogicLoader =>
  async () => (await load())[name] as LogicCtor

export const LOGIC_LOADERS: Record<string, LogicLoader> = {
  Addresses: logic(() => import('../modules/addresses/AddressLogic'), 'AddressLogic'),
  Attachments: logic(() => import('../modules/attachments/AttachmentLogic'), 'AttachmentLogic'),
  Banks: logic(() => import('../modules/banks/BankLogic'), 'BankLogic'),
  Capitals: logic(() => import('../modules/capitals/CapitalLogic'), 'CapitalLogic'),
  Carriers: logic(() => import('../modules/carriers/CarrierLogic'), 'CarrierLogic'),
  CarrierCatalogs: logic(() => import('../modules/carrier_catalogs/CarrierCatalogLogic'), 'CarrierCatalogLogic'),
  CarrierNProds: logic(() => import('../modules/carrier_n_prods/CarrierNProdLogic'), 'CarrierNProdLogic'),
  CarrierProducts: logic(() => import('../modules/carrier_products/CarrierProductLogic'), 'CarrierProductLogic'),
  ClientApps: logic(() => import('../modules/client_apps/ClientAppLogic'), 'ClientAppLogic'),
  ClientAppModules: logic(() => import('../modules/client_app_modules/ClientAppModuleLogic'), 'ClientAppModuleLogic'),
  ClientAppReleases: logic(() => import('../modules/client_app_releases/ClientAppReleaseLogic'), 'ClientAppReleaseLogic'),
  CodeRules: logic(() => import('../modules/code_rules/CodeRuleLogic'), 'CodeRuleLogic'),
  Contactors: logic(() => import('../modules/contactors/ContactorLogic'), 'ContactorLogic'),
  ContractTemplates: logic(() => import('../modules/contract_templates/ContractTemplateLogic'), 'ContractTemplateLogic'),
  Countries: logic(() => import('../modules/countries/CountryLogic'), 'CountryLogic'),
  CurrencyUnits: logic(() => import('../modules/currency_units/CurrencyUnitLogic'), 'CurrencyUnitLogic'),
  Departments: logic(() => import('../modules/departments/DepartmentLogic'), 'DepartmentLogic'),
  Employees: logic(() => import('../modules/employees/EmployeeLogic'), 'EmployeeLogic'),
  Feedbacks: logic(() => import('../modules/feedbacks/FeedbackLogic'), 'FeedbackLogic'),
  FlowTrails: logic(() => import('../modules/flow_trails/FlowTrailLogic'), 'FlowTrailLogic'),
  Holidays: logic(() => import('../modules/holidays/HolidayLogic'), 'HolidayLogic'),
  LabelTemplates: logic(() => import('../modules/label_templates/LabelTemplateLogic'), 'LabelTemplateLogic'),
  MaterialCats: logic(() => import('../modules/materialCats/MaterialCatLogic'), 'MaterialCatLogic'),
  Materials: logic(() => import('../modules/materials/MaterialLogic'), 'MaterialLogic'),
  MaterialNSkus: logic(() => import('../modules/material_n_skus/MaterialNSkuLogic'), 'MaterialNSkuLogic'),
  MaterialPackages: logic(() => import('../modules/material_packages/MaterialPackageLogic'), 'MaterialPackageLogic'),
  ModuleAuditTrails: logic(() => import('../modules/module_audit_trails/ModuleAuditTrailLogic'), 'ModuleAuditTrailLogic'),
  ModuleBgTasks: logic(() => import('../modules/module_bg_tasks/ModuleBgTaskLogic'), 'ModuleBgTaskLogic'),
  Notices: logic(() => import('../modules/notices/NoticeLogic'), 'NoticeLogic'),
  Notifications: logic(() => import('../modules/notifications/NotificationLogic'), 'NotificationLogic'),
  OrganizationUnits: logic(() => import('../modules/organization_units/OrganizationUnitLogic'), 'OrganizationUnitLogic'),
  Partners: logic(() => import('../modules/partners/PartnerLogic'), 'PartnerLogic'),
  PaymentMethods: logic(() => import('../modules/payment_methods/PaymentMethodLogic'), 'PaymentMethodLogic'),
  Persons: logic(() => import('../modules/persons/PersonLogic'), 'PersonLogic'),
  ProvinceNCities: logic(() => import('../modules/province_n_cities/ProvinceNCityLogic'), 'ProvinceNCityLogic'),
  QualityStandards: logic(() => import('../modules/quality_standards/QualityStandardLogic'), 'QualityStandardLogic'),
  Regions: logic(() => import('../modules/regions/RegionLogic'), 'RegionLogic'),
  Roles: logic(() => import('../modules/roles/RoleLogic'), 'RoleLogic'),
  Skus: logic(() => import('../modules/skus/SkuLogic'), 'SkuLogic'),
  Tenants: logic(() => import('../modules/tenants/TenantLogic'), 'TenantLogic'),
  Trashes: logic(() => import('../modules/trashes/TrashLogic'), 'TrashLogic'),
  Units: logic(() => import('../modules/units/UnitLogic'), 'UnitLogic'),
  Users: logic(() => import('../modules/users/UserLogic'), 'UserLogic'),
}

export async function createRepositoryLogic(repository: string, init: UiLogicInit) {
  const loader = LOGIC_LOADERS[repository]
  return loader ? new (await loader())(init) : undefined
}
