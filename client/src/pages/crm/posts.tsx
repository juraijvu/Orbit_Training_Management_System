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

export default function CrmPostsPage() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/crm/posts"],
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Today's Posts</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CRM Posts</CardTitle>
          <CardDescription>
            Share important updates and files with your team and leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Posts functionality is under development. Check back soon!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}