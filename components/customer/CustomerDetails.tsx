
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Edit, ArrowLeft } from "lucide-react";
import { Customer } from "@prisma/client";

interface CustomerDetailsProps {
  customer: Customer;
  onBack: () => void;
  onEdit: () => void;
}

export function CustomerDetails({ customer, onBack, onEdit }: CustomerDetailsProps) {
  return (
    <Card className="w-full max-w-4xl mx-auto neon-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Button size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
        <CardTitle className="text-2xl mt-4 flex items-center justify-between">
          {customer.name}
          {customer.tax_exempt && (
            <Badge className="ml-2" variant="outline">
              Tax Exempt
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contact Information */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customer.email && (
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customer.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Address */}
        {(customer.address || customer.city || customer.state || customer.postal_code || customer.country) && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Address</h3>
            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                {customer.address && <p>{customer.address}</p>}
                {(customer.city || customer.state || customer.postal_code) && (
                  <p>
                    {customer.city && `${customer.city}, `}
                    {customer.state && `${customer.state} `}
                    {customer.postal_code && customer.postal_code}
                  </p>
                )}
                {customer.country && <p>{customer.country}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {customer.notes && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Notes</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{customer.notes}</p>
          </div>
        )}

        {/* Created/Updated */}
        <div className="pt-4 border-t grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <p>Created</p>
            <p>{new Date(customer.created_at).toLocaleString()}</p>
          </div>
          <div>
            <p>Last Updated</p>
            <p>{new Date(customer.updated_at).toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
