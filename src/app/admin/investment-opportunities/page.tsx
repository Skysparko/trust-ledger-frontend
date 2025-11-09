"use client";

import { useState, useEffect, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Upload,
  FileText,
} from "lucide-react";
import type {
  InvestmentOpportunityListItem,
  CreateInvestmentOpportunityPayload,
  UpdateInvestmentOpportunityPayload,
  InvestmentOpportunityDetail,
  PaymentFrequency,
  InvestmentOpportunityStatus,
  InvestmentOpportunityRiskLevel,
  InvestmentOpportunityFAQ,
  InvestmentOpportunityMilestone,
} from "@/api/investment-opportunities.api";
import { InvestmentOpportunitiesApi } from "@/api/investment-opportunities.api";
import { useAllInvestmentOpportunitiesForDropdowns } from "@/hooks/swr/useInvestmentOpportunities";

const ITEMS_PER_PAGE = 10;

// Helper function to validate URL
const isValidUrl = (url: string | undefined): boolean => {
  if (!url || url.trim() === "") return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Create validation schema
const createValidationSchema = (
  uniqueSectors: string[],
  uniqueStatuses: string[],
  uniqueRiskLevels: string[],
  uniquePaymentFrequencies: string[]
) => {
  return Yup.object({
    title: Yup.string()
      .min(10, "Title must be at least 10 characters long")
      .required("Title is required"),
    company: Yup.string()
      .required("Company is required"),
    sector: Yup.string()
      .required("Sector is required"),
    type: Yup.string()
      .required("Type is required"),
    location: Yup.string()
      .required("Location is required"),
    description: Yup.string()
      .required("Description is required"),
    shortDescription: Yup.string()
      .optional(),
    rate: Yup.number()
      .typeError("Interest rate must be a number")
      .min(0, "Interest rate must be greater than 0")
      .max(100, "Interest rate cannot exceed 100%")
      .required("Interest rate is required"),
    minInvestment: Yup.number()
      .typeError("Price must be a number")
      .min(0, "Price must be greater than 0")
      .required("Price is required"),
    termMonths: Yup.number()
      .typeError("Term must be a number")
      .min(1, "Term must be at least 1 month")
      .required("Term (months) is required"),
    totalFundingTarget: Yup.number()
      .typeError("Total bonds must be a number")
      .min(0, "Total bonds must be greater than 0")
      .required("Total bonds is required"),
    paymentFrequency: Yup.string()
      .required("Payment frequency is required"),
    bondStructure: Yup.string()
      .optional(),
    creditRating: Yup.string()
      .optional(),
    earlyRedemptionAllowed: Yup.boolean()
      .default(false),
    earlyRedemptionPenalty: Yup.number()
      .typeError("Early redemption penalty must be a number")
      .min(0, "Penalty must be greater than or equal to 0")
      .max(100, "Penalty cannot exceed 100%")
      .nullable()
      .optional()
      .when("earlyRedemptionAllowed", {
        is: true,
        then: (schema) => schema.optional(),
      }),
    status: Yup.string()
      .oneOf(["active", "upcoming", "closed", "paused"], "Invalid status")
      .default("upcoming"),
    startDate: Yup.string()
      .required("Start date is required"),
    endDate: Yup.string()
      .nullable()
      .optional()
      .test("after-start", "End date must be after start date", function(value) {
        if (!value || !this.parent.startDate) return true;
        return new Date(value) >= new Date(this.parent.startDate);
      }),
    riskLevel: Yup.string()
      .oneOf(["Low", "Medium", "High"], "Invalid risk level")
      .required("Risk level is required"),
    companyDescription: Yup.string()
      .optional(),
    companyWebsite: Yup.string()
      .url("Company website must be a valid URL")
      .nullable()
      .optional(),
    companyAddress: Yup.string()
      .optional(),
    projectType: Yup.string()
      .required("Project type is required"),
    useOfFunds: Yup.string()
      .required("Use of funds is required"),
    keyHighlights: Yup.array()
      .of(Yup.string())
      .default([]),
    riskFactors: Yup.array()
      .of(Yup.string())
      .default([]),
    legalStructure: Yup.string()
      .optional(),
    jurisdiction: Yup.string()
      .optional(),
    thumbnailImage: Yup.string()
      .url("Thumbnail image must be a valid URL")
      .nullable()
      .optional(),
    logo: Yup.string()
      .url("Logo must be a valid URL")
      .nullable()
      .optional(),
    images: Yup.array()
      .of(Yup.string().url("Each image URL must be valid"))
      .default([]),
    isFeatured: Yup.boolean()
      .default(false),
    faq: Yup.array()
      .of(
        Yup.object({
          question: Yup.string().required("Question is required"),
          answer: Yup.string().required("Answer is required"),
        })
      )
      .default([]),
    milestones: Yup.array()
      .of(
        Yup.object({
          date: Yup.string().required("Milestone date is required"),
          description: Yup.string().required("Milestone description is required"),
        })
      )
      .default([]),
    tags: Yup.array()
      .of(Yup.string())
      .default([]),
    slug: Yup.string()
      .optional(),
    seoTitle: Yup.string()
      .optional(),
    seoDescription: Yup.string()
      .optional(),
  });
};

export default function AdminInvestmentOpportunitiesPage() {
  const [items, setItems] = useState<InvestmentOpportunityListItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InvestmentOpportunityListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InvestmentOpportunityListItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Fetch unique values for dropdowns
  const {
    uniqueSectors,
    uniqueStatuses,
    uniqueRiskLevels,
    uniquePaymentFrequencies,
  } = useAllInvestmentOpportunitiesForDropdowns();

  // Create validation schema
  const validationSchema = useMemo(
    () => createValidationSchema(
      uniqueSectors,
      uniqueStatuses,
      uniqueRiskLevels,
      uniquePaymentFrequencies
    ),
    [uniqueSectors, uniqueStatuses, uniqueRiskLevels, uniquePaymentFrequencies]
  );

  // Initial form values
  const getInitialValues = (): Partial<CreateInvestmentOpportunityPayload> => ({
    title: "",
    company: "",
    sector: "",
    type: "",
    location: "",
    description: "",
    shortDescription: "",
    rate: undefined,
    minInvestment: undefined,
    termMonths: undefined,
    totalFundingTarget: undefined,
    paymentFrequency: undefined,
    bondStructure: "",
    creditRating: "",
    earlyRedemptionAllowed: false,
    earlyRedemptionPenalty: undefined,
    status: "upcoming",
    startDate: "",
    endDate: "",
    riskLevel: undefined,
    companyDescription: "",
    companyWebsite: "",
    companyAddress: "",
    projectType: "",
    useOfFunds: "",
    keyHighlights: [],
    riskFactors: [],
    legalStructure: "",
    jurisdiction: "",
    thumbnailImage: "",
    logo: "",
    images: [],
    isFeatured: false,
    faq: [],
    milestones: [],
    tags: [],
    slug: "",
    seoTitle: "",
    seoDescription: "",
  });

  // Formik form
  const formik = useFormik<Partial<CreateInvestmentOpportunityPayload>>({
    initialValues: getInitialValues(),
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      setIsLoading(true);
      setError(null);
      try {
        // Format dates to ISO 8601
        const formatDate = (dateStr: string | undefined): string | undefined => {
          if (!dateStr) return undefined;
          // If it's already in ISO format, return as is
          if (dateStr.includes('T')) return dateStr;
          // Otherwise, convert YYYY-MM-DD to ISO format
          return dateStr ? `${dateStr}T00:00:00Z` : undefined;
        };

        // Calculate total offering as price * total bonds
        const calculatedMaxInvestment = values.minInvestment && values.totalFundingTarget
          ? values.minInvestment * values.totalFundingTarget
          : undefined;

        const payload: CreateInvestmentOpportunityPayload = {
          title: values.title!,
          company: values.company!,
          sector: values.sector!,
          type: values.type!,
          location: values.location!,
          description: values.description!,
          shortDescription: values.shortDescription,
          rate: values.rate!,
          minInvestment: values.minInvestment!,
          maxInvestment: calculatedMaxInvestment,
          termMonths: values.termMonths!,
          totalFundingTarget: values.totalFundingTarget!,
          paymentFrequency: values.paymentFrequency as PaymentFrequency,
          bondStructure: values.bondStructure,
          creditRating: values.creditRating,
          earlyRedemptionAllowed: values.earlyRedemptionAllowed || false,
          earlyRedemptionPenalty: values.earlyRedemptionPenalty,
          status: (values.status as InvestmentOpportunityStatus) || "upcoming",
          startDate: formatDate(values.startDate)!,
          endDate: formatDate(values.endDate),
          riskLevel: values.riskLevel as InvestmentOpportunityRiskLevel,
          companyDescription: values.companyDescription,
          companyWebsite: values.companyWebsite,
          companyAddress: values.companyAddress,
          projectType: values.projectType!,
          useOfFunds: values.useOfFunds!,
          keyHighlights: (values.keyHighlights || []).filter(h => h.trim() !== ""),
          riskFactors: (values.riskFactors || []).filter(r => r.trim() !== ""),
          legalStructure: values.legalStructure,
          jurisdiction: values.jurisdiction,
          thumbnailImage: values.thumbnailImage,
          logo: values.logo,
          images: (values.images || []).filter(img => img.trim() !== ""),
          isFeatured: values.isFeatured || false,
          faq: (values.faq || []).length > 0 ? (values.faq || []).filter(f => f.question.trim() !== "" && f.answer.trim() !== "") : undefined,
          milestones: (values.milestones || []).length > 0 ? (values.milestones || []).filter(m => m.date && m.description.trim() !== "") : undefined,
          tags: (values.tags || []).length > 0 ? (values.tags || []).filter(t => t.trim() !== "") : undefined,
          slug: values.slug,
          seoTitle: values.seoTitle,
          seoDescription: values.seoDescription,
        };

        if (editingItem) {
          await InvestmentOpportunitiesApi.updateInvestmentOpportunity(editingItem.id, payload);
        } else {
          await InvestmentOpportunitiesApi.createInvestmentOpportunity(payload);
        }
        
        // Refresh the list
        const response = await InvestmentOpportunitiesApi.getInvestmentOpportunities({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        });
        setItems(response.opportunities || []);
        setFilteredItems(response.opportunities || []);
        setIsDialogOpen(false);
        setEditingItem(null);
        formik.resetForm();
      } catch (err: any) {
        console.error("Failed to save opportunity:", err);
        const errorMessage = err.message || "Failed to save investment opportunity";
        setError(errorMessage);
        setStatus(errorMessage);
      } finally {
        setIsLoading(false);
        setSubmitting(false);
      }
    },
  });

  // Reset to page 1 when search changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchQuery]);

  // Fetch opportunities from API
  useEffect(() => {
    const fetchOpportunities = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const filters: any = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          sortBy: "createdAt",
          sortOrder: "desc",
        };

        // Add search filter if there's a search query
        if (searchQuery.trim()) {
          filters.search = searchQuery.trim();
        }

        const response = await InvestmentOpportunitiesApi.getInvestmentOpportunities(filters);
        setItems(response.opportunities || []);
        setFilteredItems(response.opportunities || []);
        setPagination(response.pagination || {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          total: 0,
          totalPages: 0,
        });
      } catch (err: any) {
        console.error("Failed to fetch investment opportunities:", err);
        setError(err.message || "Failed to load investment opportunities");
        setItems([]);
        setFilteredItems([]);
      } finally {
        setIsFetching(false);
      }
    };

    fetchOpportunities();
  }, [currentPage, searchQuery]);

  const totalPages = pagination.totalPages || Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems; // Backend handles pagination

  const handleCreate = () => {
    setEditingItem(null);
    formik.resetForm({ values: getInitialValues() });
    setActiveTab("basic");
    setIsDialogOpen(true);
  };

  const handleEdit = async (item: InvestmentOpportunityListItem) => {
    setEditingItem(item);
    setIsLoading(true);
    setError(null);
    try {
      const detail = await InvestmentOpportunitiesApi.getInvestmentOpportunity(item.id);
      // Format dates from ISO to YYYY-MM-DD for date picker
      const formatDateForPicker = (dateStr: string | undefined): string => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
      };

      formik.setValues({
        title: detail.title || "",
        company: detail.company || "",
        sector: detail.sector || "",
        type: detail.type || "",
        location: detail.location || "",
        description: detail.description || "",
        shortDescription: detail.shortDescription || "",
        rate: detail.rate,
        minInvestment: detail.minInvestment,
        maxInvestment: detail.maxInvestment,
        termMonths: detail.termMonths,
        totalFundingTarget: detail.totalFundingTarget,
        paymentFrequency: detail.paymentFrequency,
        bondStructure: detail.bondStructure || "",
        creditRating: detail.creditRating || "",
        earlyRedemptionAllowed: detail.earlyRedemptionAllowed || false,
        earlyRedemptionPenalty: detail.earlyRedemptionPenalty,
        status: detail.status || "upcoming",
        startDate: formatDateForPicker(detail.startDate),
        endDate: formatDateForPicker(detail.endDate),
        riskLevel: detail.riskLevel,
        companyDescription: detail.companyDescription || "",
        companyWebsite: detail.companyWebsite || "",
        companyAddress: detail.companyAddress || "",
        projectType: detail.projectType || "",
        useOfFunds: detail.useOfFunds || "",
        keyHighlights: detail.keyHighlights || [],
        riskFactors: detail.riskFactors || [],
        legalStructure: detail.legalStructure || "",
        jurisdiction: detail.jurisdiction || "",
        thumbnailImage: detail.thumbnailImage || "",
        logo: detail.logo || "",
        images: detail.images || [],
        isFeatured: detail.isFeatured || false,
        faq: detail.faq || [],
        milestones: (detail.milestones || []).map(m => ({ date: formatDateForPicker(m.date), description: m.description })),
        tags: detail.tags || [],
        slug: detail.slug || "",
        seoTitle: detail.seoTitle || "",
        seoDescription: detail.seoDescription || "",
      });
      setActiveTab("basic");
      setIsDialogOpen(true);
    } catch (err: any) {
      console.error("Failed to load opportunity details:", err);
      setError(err.message || "Failed to load opportunity details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setIsLoading(true);
    setError(null);
    try {
      await InvestmentOpportunitiesApi.deleteInvestmentOpportunity(itemToDelete);
      // Refresh the list
      const response = await InvestmentOpportunitiesApi.getInvestmentOpportunities({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      });
      setItems(response.opportunities || []);
      setFilteredItems(response.opportunities || []);
      setPagination(response.pagination || pagination);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err: any) {
      console.error("Failed to delete opportunity:", err);
      setError(err.message || "Failed to delete investment opportunity");
      // Keep modal open on error so user can try again or cancel
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get required fields for each tab
  const getRequiredFieldsForTab = (tab: string): string[] => {
    switch (tab) {
      case "basic":
        return ["title", "company", "sector", "type", "location", "projectType", "status", "riskLevel", "startDate", "description"];
      case "financial":
        return ["rate", "minInvestment", "termMonths", "totalFundingTarget", "paymentFrequency"];
      case "company":
        return []; // No required fields in company tab
      case "details":
        return ["useOfFunds"];
      case "media":
        return []; // No required fields in media tab
      default:
        return [];
    }
  };

  // Validate fields for a specific tab
  const validateTab = async (tab: string): Promise<boolean> => {
    const requiredFields = getRequiredFieldsForTab(tab);
    if (requiredFields.length === 0) return true;

    // Mark all required fields as touched
    const touchedFields: Record<string, boolean> = {};
    requiredFields.forEach(field => {
      touchedFields[field] = true;
    });
    formik.setTouched({ ...formik.touched, ...touchedFields });

    // Validate only the required fields for this tab
    const errors: Record<string, string> = {};
    let isValid = true;

    for (const field of requiredFields) {
      try {
        await validationSchema.validateAt(field, formik.values);
      } catch (error: any) {
        errors[field] = error.message;
        isValid = false;
      }
    }

    if (!isValid) {
      formik.setErrors({ ...formik.errors, ...errors });
    }

    return isValid;
  };

  const handleNextTab = async () => {
    const isValid = await validateTab(activeTab);
    if (!isValid) {
      return; // Don't proceed if validation fails
    }

    const tabs = ["basic", "financial", "company", "details", "media"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const handleTabChange = async (newTab: string) => {
    // Validate current tab before allowing change
    const isValid = await validateTab(activeTab);
    if (!isValid) {
      return; // Don't allow tab change if validation fails
    }
    setActiveTab(newTab);
  };

  // Helper to get error className for inputs
  const getInputErrorClass = (fieldName: string): string => {
    const touched = formik.touched[fieldName as keyof typeof formik.touched];
    const error = formik.errors[fieldName as keyof typeof formik.errors];
    return touched && error
      ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50"
      : "";
  };

  const getNextButtonText = () => {
    if (editingItem) {
      return isLoading || formik.isSubmitting ? "Saving..." : "Update";
    }
    const tabs = ["basic", "financial", "company", "details", "media"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex === tabs.length - 1) {
      return isLoading || formik.isSubmitting ? "Saving..." : "Create";
    }
    return "Next";
  };


  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30";
      case "upcoming":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30";
      case "closed":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30";
      case "paused":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investment Opportunities</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Manage all investment opportunities on the platform
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Opportunity
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Search opportunities by title, company, location, or sector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Funding</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetching ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-zinc-500">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : paginatedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-zinc-500">
                    {searchQuery ? "No opportunities found matching your search" : "No investment opportunities yet. Create one to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{item.company}</TableCell>
                    <TableCell>{item.sector}</TableCell>
                    <TableCell>{item.rate}%</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                    </TableCell>
                    <TableCell>
                      ${(item.currentFunding / 1000).toFixed(0)}K / ${(item.totalFundingTarget / 1000).toFixed(0)}K
                      <span className="text-xs text-zinc-500 ml-1">
                        ({item.fundingProgress.toFixed(1)}%)
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-zinc-500">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, pagination.total || filteredItems.length)} of{" "}
                {pagination.total || filteredItems.length} opportunities
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || isFetching}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || isFetching}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Investment Opportunity" : "Create Investment Opportunity"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Update the investment opportunity details" : "Add a new investment opportunity to the platform"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={formik.handleSubmit}>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="company">Company</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formik.values.title || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Investment Opportunity Title"
                    minLength={10}
                    className={getInputErrorClass("title")}
                  />
                  {formik.touched.title && formik.errors.title && (
                    <p className="text-xs text-red-500">{formik.errors.title}</p>
                  )}
                  {formik.values.title && !formik.errors.title && (
                    <p className="text-xs text-zinc-500">
                      {formik.values.title.trim().length} / 10 characters minimum
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    name="company"
                    value={formik.values.company || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Company Name"
                    className={getInputErrorClass("company")}
                  />
                  {formik.touched.company && formik.errors.company && (
                    <p className="text-xs text-red-500">{formik.errors.company}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sector">Sector *</Label>
                  <Select
                    id="sector"
                    value={formik.values.sector || ""}
                    className={getInputErrorClass("sector")}
                    options={[
                      { label: "Select a sector...", value: "" },
                      ...(uniqueSectors.length > 0 
                        ? uniqueSectors.map(sector => ({ label: sector, value: sector }))
                        : [
                            { label: "Technology", value: "Technology" },
                            { label: "Healthcare", value: "Healthcare" },
                            { label: "Manufacturing", value: "Manufacturing" },
                            { label: "Financial Services", value: "Financial Services" },
                            { label: "Energy", value: "Energy" },
                            { label: "Real Estate", value: "Real Estate" },
                            { label: "Agriculture", value: "Agriculture" },
                            { label: "Education", value: "Education" },
                            { label: "Other", value: "Other" },
                          ]
                      )
                    ]}
                    onValueChange={(value) => {
                      formik.setFieldValue("sector", value && value.trim() !== "" ? value : undefined);
                    }}
                  />
                  {formik.touched.sector && formik.errors.sector && (
                    <p className="text-xs text-red-500">{formik.errors.sector}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Input
                    id="type"
                    name="type"
                    value={formik.values.type || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g., Bond, Equity, Convertible"
                    className={getInputErrorClass("type")}
                  />
                  {formik.touched.type && formik.errors.type && (
                    <p className="text-xs text-red-500">{formik.errors.type}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formik.values.location || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="City, Country"
                    className={getInputErrorClass("location")}
                  />
                  {formik.touched.location && formik.errors.location && (
                    <p className="text-xs text-red-500">{formik.errors.location}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectType">Project Type *</Label>
                  <Input
                    id="projectType"
                    name="projectType"
                    value={formik.values.projectType || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g., Green Bond, Infrastructure, etc."
                    className={getInputErrorClass("projectType")}
                  />
                  {formik.touched.projectType && formik.errors.projectType && (
                    <p className="text-xs text-red-500">{formik.errors.projectType}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    id="status"
                    value={formik.values.status || "upcoming"}
                    options={uniqueStatuses.length > 0
                      ? uniqueStatuses.map(status => ({ 
                          label: status.charAt(0).toUpperCase() + status.slice(1), 
                          value: status 
                        }))
                      : [
                          { label: "Active", value: "active" },
                          { label: "Upcoming", value: "upcoming" },
                          { label: "Closed", value: "closed" },
                          { label: "Paused", value: "paused" },
                        ]
                    }
                    onValueChange={(value) => formik.setFieldValue("status", value as InvestmentOpportunityStatus)}
                  />
                  {formik.touched.status && formik.errors.status && (
                    <p className="text-xs text-red-500">{formik.errors.status}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="riskLevel">Risk Level *</Label>
                  <Select
                    id="riskLevel"
                    value={formik.values.riskLevel || ""}
                    className={getInputErrorClass("riskLevel")}
                    options={[
                      { label: "Select risk level...", value: "" },
                      { label: "Low", value: "Low" },
                      { label: "Medium", value: "Medium" },
                      { label: "High", value: "High" },
                    ]}
                    onValueChange={(value) => {
                      formik.setFieldValue("riskLevel", value && value.trim() !== "" ? (value as InvestmentOpportunityRiskLevel) : undefined);
                    }}
                  />
                  {formik.touched.riskLevel && formik.errors.riskLevel && (
                    <p className="text-xs text-red-500">{formik.errors.riskLevel}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <DatePicker
                    id="startDate"
                    value={formik.values.startDate || ""}
                    onChange={(value) => formik.setFieldValue("startDate", value)}
                    placeholder="Select start date"
                    className={getInputErrorClass("startDate")}
                  />
                  {formik.touched.startDate && formik.errors.startDate && (
                    <p className="text-xs text-red-500">{formik.errors.startDate}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <DatePicker
                    id="endDate"
                    value={formik.values.endDate || ""}
                    onChange={(value) => formik.setFieldValue("endDate", value)}
                    placeholder="Select end date"
                  />
                  {formik.touched.endDate && formik.errors.endDate && (
                    <p className="text-xs text-red-500">{formik.errors.endDate}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                  id="shortDescription"
                  name="shortDescription"
                  value={formik.values.shortDescription || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Brief summary (1-2 sentences)"
                />
                {formik.touched.shortDescription && formik.errors.shortDescription && (
                  <p className="text-xs text-red-500">{formik.errors.shortDescription}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description *</Label>
                <textarea
                  id="description"
                  name="description"
                  className={`w-full min-h-[120px] rounded-lg border px-3 py-2 dark:bg-zinc-900 ${
                    formik.touched.description && formik.errors.description
                      ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50"
                      : "border-zinc-300 dark:border-zinc-700"
                  }`}
                  value={formik.values.description || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Detailed description of the investment opportunity..."
                />
                {formik.touched.description && formik.errors.description && (
                  <p className="text-xs text-red-500">{formik.errors.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formik.values.isFeatured || false}
                  onChange={(e) => formik.setFieldValue("isFeatured", e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300"
                />
                <Label htmlFor="isFeatured" className="cursor-pointer">
                  Featured Opportunity
                </Label>
              </div>
            </TabsContent>

            {/* Financial Information Tab */}
            <TabsContent value="financial" className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rate">Interest Rate (%) *</Label>
                  <Input
                    id="rate"
                    name="rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formik.values.rate || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      formik.setFieldValue("rate", val === "" ? undefined : parseFloat(val));
                    }}
                    onBlur={formik.handleBlur}
                    placeholder="7.5"
                    className={getInputErrorClass("rate")}
                  />
                  {formik.touched.rate && formik.errors.rate && (
                    <p className="text-xs text-red-500">{formik.errors.rate}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="termMonths">Term (Months) *</Label>
                  <Input
                    id="termMonths"
                    name="termMonths"
                    type="number"
                    min="1"
                    value={formik.values.termMonths || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      formik.setFieldValue("termMonths", val === "" ? undefined : parseInt(val));
                    }}
                    onBlur={formik.handleBlur}
                    placeholder="36"
                    className={getInputErrorClass("termMonths")}
                  />
                  {formik.touched.termMonths && formik.errors.termMonths && (
                    <p className="text-xs text-red-500">{formik.errors.termMonths}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentFrequency">Payment Frequency *</Label>
                  <Select
                    id="paymentFrequency"
                    value={formik.values.paymentFrequency || ""}
                    className={getInputErrorClass("paymentFrequency")}
                    options={[
                      { label: "Select payment frequency...", value: "" },
                      ...uniquePaymentFrequencies.map(freq => ({ label: freq, value: freq }))
                    ]}
                    onValueChange={(value) => {
                      formik.setFieldValue("paymentFrequency", value && value.trim() !== "" ? (value as PaymentFrequency) : undefined);
                    }}
                  />
                  {formik.touched.paymentFrequency && formik.errors.paymentFrequency && (
                    <p className="text-xs text-red-500">{formik.errors.paymentFrequency}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minInvestment">Price ($) *</Label>
                  <Input
                    id="minInvestment"
                    name="minInvestment"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formik.values.minInvestment || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      formik.setFieldValue("minInvestment", val === "" ? undefined : parseFloat(val));
                    }}
                    onBlur={formik.handleBlur}
                    placeholder="100"
                    className={getInputErrorClass("minInvestment")}
                  />
                  {formik.touched.minInvestment && formik.errors.minInvestment && (
                    <p className="text-xs text-red-500">{formik.errors.minInvestment}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalFundingTarget">Total Bonds ($) *</Label>
                  <Input
                    id="totalFundingTarget"
                    name="totalFundingTarget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formik.values.totalFundingTarget || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      formik.setFieldValue("totalFundingTarget", val === "" ? undefined : parseFloat(val));
                    }}
                    onBlur={formik.handleBlur}
                    placeholder="1000000"
                    className={getInputErrorClass("totalFundingTarget")}
                  />
                  {formik.touched.totalFundingTarget && formik.errors.totalFundingTarget && (
                    <p className="text-xs text-red-500">{formik.errors.totalFundingTarget}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bondStructure">Bond Structure</Label>
                  <Input
                    id="bondStructure"
                    name="bondStructure"
                    value={formik.values.bondStructure || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g., Senior Secured Bond"
                  />
                  {formik.touched.bondStructure && formik.errors.bondStructure && (
                    <p className="text-xs text-red-500">{formik.errors.bondStructure}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditRating">Credit Rating</Label>
                  <Input
                    id="creditRating"
                    name="creditRating"
                    value={formik.values.creditRating || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g., AA, A-, BBB+"
                  />
                  {formik.touched.creditRating && formik.errors.creditRating && (
                    <p className="text-xs text-red-500">{formik.errors.creditRating}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="earlyRedemptionAllowed"
                  checked={formik.values.earlyRedemptionAllowed || false}
                  onChange={(e) => formik.setFieldValue("earlyRedemptionAllowed", e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300"
                />
                <Label htmlFor="earlyRedemptionAllowed" className="cursor-pointer">
                  Early Redemption Allowed
                </Label>
              </div>

              {formik.values.earlyRedemptionAllowed && (
                <div className="space-y-2">
                  <Label htmlFor="earlyRedemptionPenalty">Early Redemption Penalty (%)</Label>
                  <Input
                    id="earlyRedemptionPenalty"
                    name="earlyRedemptionPenalty"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formik.values.earlyRedemptionPenalty || ""}
                    onChange={(e) => formik.setFieldValue("earlyRedemptionPenalty", parseFloat(e.target.value) || undefined)}
                    onBlur={formik.handleBlur}
                    placeholder="5.0"
                  />
                  {formik.touched.earlyRedemptionPenalty && formik.errors.earlyRedemptionPenalty && (
                    <p className="text-xs text-red-500">{formik.errors.earlyRedemptionPenalty}</p>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Company Information Tab */}
            <TabsContent value="company" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="companyDescription">Company Description</Label>
                <textarea
                  id="companyDescription"
                  name="companyDescription"
                  className="w-full min-h-[100px] rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                  value={formik.values.companyDescription || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="About the company..."
                />
                {formik.touched.companyDescription && formik.errors.companyDescription && (
                  <p className="text-xs text-red-500">{formik.errors.companyDescription}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Company Website</Label>
                  <Input
                    id="companyWebsite"
                    name="companyWebsite"
                    type="url"
                    value={formik.values.companyWebsite || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="https://example.com"
                  />
                  {formik.touched.companyWebsite && formik.errors.companyWebsite && (
                    <p className="text-xs text-red-500">{formik.errors.companyWebsite}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Company Address</Label>
                  <Input
                    id="companyAddress"
                    name="companyAddress"
                    value={formik.values.companyAddress || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Street, City, Country"
                  />
                  {formik.touched.companyAddress && formik.errors.companyAddress && (
                    <p className="text-xs text-red-500">{formik.errors.companyAddress}</p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Additional Details Tab */}
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="useOfFunds">Use of Funds *</Label>
                <textarea
                  id="useOfFunds"
                  name="useOfFunds"
                  className={`w-full min-h-[100px] rounded-lg border px-3 py-2 dark:bg-zinc-900 ${
                    formik.touched.useOfFunds && formik.errors.useOfFunds
                      ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50"
                      : "border-zinc-300 dark:border-zinc-700"
                  }`}
                  value={formik.values.useOfFunds || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="How will the funds be used?"
                />
                {formik.touched.useOfFunds && formik.errors.useOfFunds && (
                  <p className="text-xs text-red-500">{formik.errors.useOfFunds}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Key Highlights</Label>
                <div className="space-y-2">
                  {(formik.values.keyHighlights || []).map((highlight, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={highlight}
                        onChange={(e) => {
                          const updated = [...(formik.values.keyHighlights || [])];
                          updated[index] = e.target.value;
                          formik.setFieldValue("keyHighlights", updated);
                        }}
                        placeholder="Key highlight"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const updated = (formik.values.keyHighlights || []).filter((_, i) => i !== index);
                          formik.setFieldValue("keyHighlights", updated);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      formik.setFieldValue("keyHighlights", [...(formik.values.keyHighlights || []), ""]);
                    }}
                  >
                    + Add Highlight
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Risk Factors</Label>
                <div className="space-y-2">
                  {(formik.values.riskFactors || []).map((risk, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={risk}
                        onChange={(e) => {
                          const updated = [...(formik.values.riskFactors || [])];
                          updated[index] = e.target.value;
                          formik.setFieldValue("riskFactors", updated);
                        }}
                        placeholder="Risk factor"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const updated = (formik.values.riskFactors || []).filter((_, i) => i !== index);
                          formik.setFieldValue("riskFactors", updated);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      formik.setFieldValue("riskFactors", [...(formik.values.riskFactors || []), ""]);
                    }}
                  >
                    + Add Risk Factor
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="legalStructure">Legal Structure</Label>
                  <Input
                    id="legalStructure"
                    name="legalStructure"
                    value={formik.values.legalStructure || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g., BV, NV"
                  />
                  {formik.touched.legalStructure && formik.errors.legalStructure && (
                    <p className="text-xs text-red-500">{formik.errors.legalStructure}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jurisdiction">Jurisdiction</Label>
                  <Input
                    id="jurisdiction"
                    name="jurisdiction"
                    value={formik.values.jurisdiction || ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g., Netherlands"
                  />
                  {formik.touched.jurisdiction && formik.errors.jurisdiction && (
                    <p className="text-xs text-red-500">{formik.errors.jurisdiction}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={(formik.values.tags || []).join(", ")}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    const parsedTags = inputValue
                      .split(",")
                      .map(t => t.trim())
                      .filter(t => t.length > 0);
                    formik.setFieldValue("tags", parsedTags);
                  }}
                  onBlur={(e) => {
                    const parsedTags = e.target.value
                      .split(",")
                      .map(t => t.trim())
                      .filter(t => t.length > 0);
                    formik.setFieldValue("tags", parsedTags);
                  }}
                  placeholder="tag1, tag2, tag3"
                />
                {(formik.values.tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(formik.values.tags || []).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="thumbnailImage">Thumbnail Image URL</Label>
                <Input
                  id="thumbnailImage"
                  name="thumbnailImage"
                  type="url"
                  value={formik.values.thumbnailImage || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="https://example.com/image.jpg"
                />
                {formik.touched.thumbnailImage && formik.errors.thumbnailImage && (
                  <p className="text-xs text-red-500">{formik.errors.thumbnailImage}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Company Logo URL</Label>
                <Input
                  id="logo"
                  name="logo"
                  type="url"
                  value={formik.values.logo || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="https://example.com/logo.png"
                />
                {formik.touched.logo && formik.errors.logo && (
                  <p className="text-xs text-red-500">{formik.errors.logo}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Additional Images</Label>
                <div className="space-y-2">
                  {(formik.values.images || []).map((url, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex gap-2">
                        <Input
                          type="url"
                          value={url}
                          onChange={(e) => {
                            const updated = [...(formik.values.images || [])];
                            updated[index] = e.target.value;
                            formik.setFieldValue("images", updated);
                          }}
                          placeholder="https://example.com/image.jpg"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const updated = (formik.values.images || []).filter((_, i) => i !== index);
                            formik.setFieldValue("images", updated);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {formik.errors.images && typeof formik.errors.images === 'string' && (
                        <p className="text-xs text-red-500">{formik.errors.images}</p>
                      )}
                      {Array.isArray(formik.errors.images) && formik.errors.images[index] && (
                        <p className="text-xs text-red-500">{formik.errors.images[index]}</p>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      formik.setFieldValue("images", [...(formik.values.images || []), ""]);
                    }}
                  >
                    + Add Image URL
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            {!editingItem && activeTab !== "media" ? (
              <Button type="button" onClick={handleNextTab} disabled={isLoading || formik.isSubmitting}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading || formik.isSubmitting}>
                {getNextButtonText()}
              </Button>
            )}
          </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={confirmDelete}
        title="Delete Investment Opportunity"
        description="Are you sure you want to delete this investment opportunity? This action cannot be undone."
        isLoading={isLoading}
      />
    </div>
  );
}

