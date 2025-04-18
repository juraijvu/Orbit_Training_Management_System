import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";

export default function CorporateLeadsPage() {
  const { data: corporateLeads, isLoading } = useQuery({
    queryKey: ["/api/crm/corporate-leads"],
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Corporate Leads</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Corporate Lead
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Corporate Leads List</CardTitle>
          <CardDescription>
            Manage your business-to-business leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Corporate leads functionality is under development. Check back soon!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}