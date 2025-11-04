"use client";

import { useState, useEffect } from "react";
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
  
  // Form state
  const [formData, setFormData] = useState<Partial<CreateInvestmentOpportunityPayload>>({
    status: "upcoming",
    earlyRedemptionAllowed: false,
    isFeatured: false,
    keyHighlights: [],
    riskFactors: [],
    images: [],
    milestones: [],
    faq: [],
    tags: [],
  });

  // Dynamic arrays for multi-input fields
  const [keyHighlights, setKeyHighlights] = useState<string[]>([]);
  const [riskFactors, setRiskFactors] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [milestones, setMilestones] = useState<Omit<InvestmentOpportunityMilestone, "status">[]>([]);
  const [faqs, setFaqs] = useState<InvestmentOpportunityFAQ[]>([]);
  const [tags, setTags] = useState<string[]>([]);

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
    setFormData({
      status: "upcoming",
      earlyRedemptionAllowed: false,
      isFeatured: false,
      keyHighlights: [],
      riskFactors: [],
      images: [],
      milestones: [],
      faq: [],
      tags: [],
    });
    setKeyHighlights([]);
    setRiskFactors([]);
    setImageUrls([]);
    setMilestones([]);
    setFaqs([]);
    setTags([]);
    setActiveTab("basic");
    setIsDialogOpen(true);
  };

  const handleEdit = async (item: InvestmentOpportunityListItem) => {
    setEditingItem(item);
    setIsLoading(true);
    setError(null);
    try {
      const detail = await InvestmentOpportunitiesApi.getInvestmentOpportunity(item.id);
      setFormData(detail);
      setKeyHighlights(detail.keyHighlights || []);
      setRiskFactors(detail.riskFactors || []);
      setImageUrls(detail.images || []);
      setMilestones((detail.milestones || []).map(m => ({ date: m.date, description: m.description })));
      setFaqs(detail.faq || []);
      setTags(detail.tags || []);
      setActiveTab("basic");
      setIsDialogOpen(true);
    } catch (err: any) {
      console.error("Failed to load opportunity details:", err);
      setError(err.message || "Failed to load opportunity details");
      alert(err.message || "Failed to load opportunity details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this investment opportunity?")) {
      setIsLoading(true);
      setError(null);
      try {
        await InvestmentOpportunitiesApi.deleteInvestmentOpportunity(id);
        // Refresh the list
        const response = await InvestmentOpportunitiesApi.getInvestmentOpportunities({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        });
        setItems(response.opportunities || []);
        setFilteredItems(response.opportunities || []);
        setPagination(response.pagination || pagination);
      } catch (err: any) {
        console.error("Failed to delete opportunity:", err);
        setError(err.message || "Failed to delete investment opportunity");
        alert(err.message || "Failed to delete investment opportunity");
      } finally {
        setIsLoading(false);
      }
    }
  };

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

  const handleSave = async () => {
    // Validate required fields with detailed checking
    const missingFields: string[] = [];
    const validationErrors: string[] = [];
    
    // Title validation - must be at least 10 characters
    if (!formData.title || formData.title.trim() === "") {
      missingFields.push("Title");
    } else if (formData.title.trim().length < 10) {
      validationErrors.push("Title must be at least 10 characters long");
    }
    
    if (!formData.company || formData.company.trim() === "") missingFields.push("Company");
    if (!formData.sector || formData.sector.trim() === "") missingFields.push("Sector");
    if (!formData.type || formData.type.trim() === "") missingFields.push("Type");
    if (!formData.location || formData.location.trim() === "") missingFields.push("Location");
    if (!formData.description || formData.description.trim() === "") missingFields.push("Description");
    if (formData.rate === undefined || formData.rate === null || isNaN(formData.rate) || formData.rate <= 0) missingFields.push("Interest Rate");
    if (formData.minInvestment === undefined || formData.minInvestment === null || isNaN(formData.minInvestment) || formData.minInvestment <= 0) missingFields.push("Min Investment");
    if (formData.termMonths === undefined || formData.termMonths === null || isNaN(formData.termMonths) || formData.termMonths <= 0) missingFields.push("Term (Months)");
    if (formData.totalFundingTarget === undefined || formData.totalFundingTarget === null || isNaN(formData.totalFundingTarget) || formData.totalFundingTarget <= 0) missingFields.push("Total Funding Target");
    
    // Check string fields - handle both undefined and empty strings
    const checkStringField = (value: any, fieldName: string) => {
      if (!value || (typeof value === "string" && value.trim() === "")) {
        missingFields.push(fieldName);
      }
    };
    
    checkStringField(formData.sector, "Sector");
    checkStringField(formData.paymentFrequency, "Payment Frequency");
    checkStringField(formData.startDate, "Start Date");
    checkStringField(formData.riskLevel, "Risk Level");
    checkStringField(formData.projectType, "Project Type");
    checkStringField(formData.useOfFunds, "Use of Funds");
    
    // Validate URL fields (only if they are provided)
    if (formData.companyWebsite && !isValidUrl(formData.companyWebsite)) {
      validationErrors.push("Company Website must be a valid URL (e.g., https://example.com)");
    }
    if (formData.thumbnailImage && !isValidUrl(formData.thumbnailImage)) {
      validationErrors.push("Thumbnail Image must be a valid URL (e.g., https://example.com/image.jpg)");
    }
    if (formData.logo && !isValidUrl(formData.logo)) {
      validationErrors.push("Logo must be a valid URL (e.g., https://example.com/logo.png)");
    }
    if (formData.videoUrl && !isValidUrl(formData.videoUrl)) {
      validationErrors.push("Video URL must be a valid URL (e.g., https://example.com/video.mp4)");
    }
    
    // Validate image URLs in the array
    imageUrls.forEach((url, index) => {
      if (url && url.trim() !== "" && !isValidUrl(url)) {
        validationErrors.push(`Additional Image ${index + 1} must be a valid URL`);
      }
    });
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields:\n\n${missingFields.join("\n")}`);
      return;
    }
    
    if (validationErrors.length > 0) {
      alert(`Please fix the following validation errors:\n\n${validationErrors.join("\n")}`);
      return;
    }

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

      const payload: CreateInvestmentOpportunityPayload = {
        title: formData.title!,
        company: formData.company!,
        sector: formData.sector!,
        type: formData.type!,
        location: formData.location!,
        description: formData.description!,
        shortDescription: formData.shortDescription,
        rate: formData.rate!,
        minInvestment: formData.minInvestment!,
        maxInvestment: formData.maxInvestment,
        termMonths: formData.termMonths!,
        totalFundingTarget: formData.totalFundingTarget!,
        paymentFrequency: formData.paymentFrequency!,
        bondStructure: formData.bondStructure,
        creditRating: formData.creditRating,
        earlyRedemptionAllowed: formData.earlyRedemptionAllowed || false,
        earlyRedemptionPenalty: formData.earlyRedemptionPenalty,
        status: formData.status || "upcoming",
        startDate: formatDate(formData.startDate)!,
        endDate: formatDate(formData.endDate),
        riskLevel: formData.riskLevel!,
        companyDescription: formData.companyDescription,
        companyWebsite: formData.companyWebsite,
        companyAddress: formData.companyAddress,
        projectType: formData.projectType!,
        useOfFunds: formData.useOfFunds!,
        keyHighlights: keyHighlights.filter(h => h.trim() !== ""),
        riskFactors: riskFactors.filter(r => r.trim() !== ""),
        legalStructure: formData.legalStructure,
        jurisdiction: formData.jurisdiction,
        thumbnailImage: formData.thumbnailImage,
        logo: formData.logo,
        images: imageUrls.filter(img => img.trim() !== ""),
        videoUrl: formData.videoUrl,
        isFeatured: formData.isFeatured || false,
        faq: faqs.length > 0 ? faqs.filter(f => f.question.trim() !== "" && f.answer.trim() !== "") : undefined,
        milestones: milestones.length > 0 ? milestones.filter(m => m.date && m.description.trim() !== "") : undefined,
        tags: tags.length > 0 ? tags.filter(t => t.trim() !== "") : undefined,
        slug: formData.slug,
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
      };

      if (editingItem) {
        await InvestmentOpportunitiesApi.updateInvestmentOpportunity(editingItem.id, payload);
        // Refresh the list
        const response = await InvestmentOpportunitiesApi.getInvestmentOpportunities({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        });
        setItems(response.opportunities || []);
        setFilteredItems(response.opportunities || []);
      } else {
        await InvestmentOpportunitiesApi.createInvestmentOpportunity(payload);
        // Refresh the list
        const response = await InvestmentOpportunitiesApi.getInvestmentOpportunities({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        });
        setItems(response.opportunities || []);
        setFilteredItems(response.opportunities || []);
      }
      setIsDialogOpen(false);
      setEditingItem(null);
      resetForm();
    } catch (err: any) {
      console.error("Failed to save opportunity:", err);
      const errorMessage = err.message || "Failed to save investment opportunity";
      setError(errorMessage);
      alert(errorMessage + (err.data?.errors ? "\n" + JSON.stringify(err.data.errors, null, 2) : ""));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      status: "upcoming",
      earlyRedemptionAllowed: false,
      isFeatured: false,
      keyHighlights: [],
      riskFactors: [],
      images: [],
      milestones: [],
      faq: [],
      tags: [],
    });
    setKeyHighlights([]);
    setRiskFactors([]);
    setImageUrls([]);
    setMilestones([]);
    setFaqs([]);
    setTags([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "upcoming":
        return "bg-blue-500";
      case "closed":
        return "bg-gray-500";
      case "paused":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const addArrayItem = (array: string[], setter: (items: string[]) => void, newItem: string) => {
    setter([...array, newItem.trim()]);
  };

  const removeArrayItem = (array: string[], setter: (items: string[]) => void, index: number) => {
    setter(array.filter((_, i) => i !== index));
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
                      €{(item.currentFunding / 1000).toFixed(0)}K / €{(item.totalFundingTarget / 1000).toFixed(0)}K
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

          <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Investment Opportunity Title"
                    minLength={10}
                  />
                  {formData.title && (
                    <p className={`text-xs ${formData.title.trim().length < 10 ? "text-red-500" : "text-zinc-500"}`}>
                      {formData.title.trim().length} / 10 characters minimum
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    value={formData.company || ""}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Company Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sector">Sector *</Label>
                  <Select
                    id="sector"
                    value={formData.sector || ""}
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
                      const sectorValue = value && value.trim() !== "" ? value : undefined;
                      setFormData({ ...formData, sector: sectorValue });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Input
                    id="type"
                    value={formData.type || ""}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="e.g., Bond, Equity, Convertible"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location || ""}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectType">Project Type *</Label>
                  <Input
                    id="projectType"
                    value={formData.projectType || ""}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    placeholder="e.g., Green Bond, Infrastructure, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    id="status"
                    value={formData.status || "upcoming"}
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
                    onValueChange={(value) => setFormData({ ...formData, status: value as InvestmentOpportunityStatus })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="riskLevel">Risk Level *</Label>
                  <Select
                    id="riskLevel"
                    value={formData.riskLevel || ""}
                    options={[
                      { label: "Select risk level...", value: "" },
                      ...(uniqueRiskLevels.length > 0
                        ? uniqueRiskLevels.map(level => ({ label: level, value: level }))
                        : [
                            { label: "Low", value: "Low" },
                            { label: "Medium", value: "Medium" },
                            { label: "High", value: "High" },
                          ]
                      )
                    ]}
                    onValueChange={(value) => {
                      const riskLevelValue = value && value.trim() !== "" ? (value as InvestmentOpportunityRiskLevel) : undefined;
                      setFormData({ ...formData, riskLevel: riskLevelValue });
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <DatePicker
                    id="startDate"
                    value={formData.startDate || ""}
                    onChange={(value) => setFormData({ ...formData, startDate: value })}
                    placeholder="Select start date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <DatePicker
                    id="endDate"
                    value={formData.endDate || ""}
                    onChange={(value) => setFormData({ ...formData, endDate: value })}
                    placeholder="Select end date"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                  id="shortDescription"
                  value={formData.shortDescription || ""}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Brief summary (1-2 sentences)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description *</Label>
                <textarea
                  id="description"
                  className="w-full min-h-[120px] rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the investment opportunity..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured || false}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
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
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.rate || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, rate: val === "" ? undefined : parseFloat(val) });
                    }}
                    placeholder="7.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="termMonths">Term (Months) *</Label>
                  <Input
                    id="termMonths"
                    type="number"
                    min="1"
                    value={formData.termMonths || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, termMonths: val === "" ? undefined : parseInt(val) });
                    }}
                    placeholder="36"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentFrequency">Payment Frequency *</Label>
                  <Select
                    id="paymentFrequency"
                    value={formData.paymentFrequency || ""}
                    options={[
                      { label: "Select payment frequency...", value: "" },
                      ...uniquePaymentFrequencies.map(freq => ({ label: freq, value: freq }))
                    ]}
                    onValueChange={(value) => {
                      const paymentFrequencyValue = value && value.trim() !== "" ? (value as PaymentFrequency) : undefined;
                      setFormData({ ...formData, paymentFrequency: paymentFrequencyValue });
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minInvestment">Min Investment (€) *</Label>
                  <Input
                    id="minInvestment"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minInvestment || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, minInvestment: val === "" ? undefined : parseFloat(val) });
                    }}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxInvestment">Max Investment (€)</Label>
                  <Input
                    id="maxInvestment"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.maxInvestment || ""}
                    onChange={(e) => setFormData({ ...formData, maxInvestment: parseFloat(e.target.value) || undefined })}
                    placeholder="50000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalFundingTarget">Total Target (€) *</Label>
                  <Input
                    id="totalFundingTarget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.totalFundingTarget || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, totalFundingTarget: val === "" ? undefined : parseFloat(val) });
                    }}
                    placeholder="1000000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bondStructure">Bond Structure</Label>
                  <Input
                    id="bondStructure"
                    value={formData.bondStructure || ""}
                    onChange={(e) => setFormData({ ...formData, bondStructure: e.target.value })}
                    placeholder="e.g., Senior Secured Bond"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditRating">Credit Rating</Label>
                  <Input
                    id="creditRating"
                    value={formData.creditRating || ""}
                    onChange={(e) => setFormData({ ...formData, creditRating: e.target.value })}
                    placeholder="e.g., AA, A-, BBB+"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="earlyRedemptionAllowed"
                  checked={formData.earlyRedemptionAllowed || false}
                  onChange={(e) => setFormData({ ...formData, earlyRedemptionAllowed: e.target.checked })}
                  className="h-4 w-4 rounded border-zinc-300"
                />
                <Label htmlFor="earlyRedemptionAllowed" className="cursor-pointer">
                  Early Redemption Allowed
                </Label>
              </div>

              {formData.earlyRedemptionAllowed && (
                <div className="space-y-2">
                  <Label htmlFor="earlyRedemptionPenalty">Early Redemption Penalty (%)</Label>
                  <Input
                    id="earlyRedemptionPenalty"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.earlyRedemptionPenalty || ""}
                    onChange={(e) => setFormData({ ...formData, earlyRedemptionPenalty: parseFloat(e.target.value) || undefined })}
                    placeholder="5.0"
                  />
                </div>
              )}
            </TabsContent>

            {/* Company Information Tab */}
            <TabsContent value="company" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="companyDescription">Company Description</Label>
                <textarea
                  id="companyDescription"
                  className="w-full min-h-[100px] rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                  value={formData.companyDescription || ""}
                  onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
                  placeholder="About the company..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Company Website</Label>
                  <Input
                    id="companyWebsite"
                    type="url"
                    value={formData.companyWebsite || ""}
                    onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                    placeholder="https://example.com"
                  />
                  {formData.companyWebsite && formData.companyWebsite.trim() !== "" && !isValidUrl(formData.companyWebsite) && (
                    <p className="text-xs text-red-500">Please enter a valid URL (e.g., https://example.com)</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Company Address</Label>
                  <Input
                    id="companyAddress"
                    value={formData.companyAddress || ""}
                    onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                    placeholder="Street, City, Country"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Additional Details Tab */}
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="useOfFunds">Use of Funds *</Label>
                <textarea
                  id="useOfFunds"
                  className="w-full min-h-[100px] rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                  value={formData.useOfFunds || ""}
                  onChange={(e) => setFormData({ ...formData, useOfFunds: e.target.value })}
                  placeholder="How will the funds be used?"
                />
              </div>

              <div className="space-y-2">
                <Label>Key Highlights</Label>
                <div className="space-y-2">
                  {keyHighlights.map((highlight, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={highlight}
                        onChange={(e) => {
                          const updated = [...keyHighlights];
                          updated[index] = e.target.value;
                          setKeyHighlights(updated);
                        }}
                        placeholder="Key highlight"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayItem(keyHighlights, setKeyHighlights, index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem(keyHighlights, setKeyHighlights, "")}
                  >
                    + Add Highlight
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Risk Factors</Label>
                <div className="space-y-2">
                  {riskFactors.map((risk, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={risk}
                        onChange={(e) => {
                          const updated = [...riskFactors];
                          updated[index] = e.target.value;
                          setRiskFactors(updated);
                        }}
                        placeholder="Risk factor"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayItem(riskFactors, setRiskFactors, index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem(riskFactors, setRiskFactors, "")}
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
                    value={formData.legalStructure || ""}
                    onChange={(e) => setFormData({ ...formData, legalStructure: e.target.value })}
                    placeholder="e.g., BV, NV"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jurisdiction">Jurisdiction</Label>
                  <Input
                    id="jurisdiction"
                    value={formData.jurisdiction || ""}
                    onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                    placeholder="e.g., Netherlands"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={tags.join(", ")}
                  onChange={(e) => setTags(e.target.value.split(",").map(t => t.trim()).filter(t => t))}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="thumbnailImage">Thumbnail Image URL</Label>
                <Input
                  id="thumbnailImage"
                  type="url"
                  value={formData.thumbnailImage || ""}
                  onChange={(e) => setFormData({ ...formData, thumbnailImage: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.thumbnailImage && formData.thumbnailImage.trim() !== "" && !isValidUrl(formData.thumbnailImage) && (
                  <p className="text-xs text-red-500">Please enter a valid URL (e.g., https://example.com/image.jpg)</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Company Logo URL</Label>
                <Input
                  id="logo"
                  type="url"
                  value={formData.logo || ""}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
                {formData.logo && formData.logo.trim() !== "" && !isValidUrl(formData.logo) && (
                  <p className="text-xs text-red-500">Please enter a valid URL (e.g., https://example.com/logo.png)</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Additional Images</Label>
                <div className="space-y-2">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex gap-2">
                        <Input
                          type="url"
                          value={url}
                          onChange={(e) => {
                            const updated = [...imageUrls];
                            updated[index] = e.target.value;
                            setImageUrls(updated);
                          }}
                          placeholder="https://example.com/image.jpg"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeArrayItem(imageUrls, setImageUrls, index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {url && url.trim() !== "" && !isValidUrl(url) && (
                        <p className="text-xs text-red-500">Please enter a valid URL (e.g., https://example.com/image.jpg)</p>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem(imageUrls, setImageUrls, "")}
                  >
                    + Add Image URL
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  type="url"
                  value={formData.videoUrl || ""}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://example.com/video.mp4 or YouTube/Vimeo URL"
                />
                {formData.videoUrl && formData.videoUrl.trim() !== "" && !isValidUrl(formData.videoUrl) && (
                  <p className="text-xs text-red-500">Please enter a valid URL (e.g., https://example.com/video.mp4)</p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : editingItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

