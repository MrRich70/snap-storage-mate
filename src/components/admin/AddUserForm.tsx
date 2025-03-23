
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { confirmUserEmail } from '@/lib/auth/admin-operations';

// Form validation schema
const addUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  accessCode: z.string().min(1, "Access code is required")
});

type AddUserFormValues = z.infer<typeof addUserSchema>;

interface AddUserFormProps {
  onSuccess: () => void;
}

const AddUserForm: React.FC<AddUserFormProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      accessCode: ""
    }
  });

  const onSubmit = async (data: AddUserFormValues) => {
    setIsSubmitting(true);
    try {
      // Create the user with admin privileges
      const { data: userData, error } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          name: data.name,
          accessCode: data.accessCode
        }
      });

      if (error) {
        toast.error(`Failed to create user: ${error.message}`);
        console.error("Error creating user:", error);
        return;
      }

      // Double-check email confirmation
      await confirmUserEmail(data.email);
      
      toast.success(`User created successfully: ${data.email}`);
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Error in admin user creation:", error);
      toast.error("Failed to create user. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border p-4 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Add New User</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="user@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="accessCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Access Code</FormLabel>
                <FormControl>
                  <Input placeholder="Enter access code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create User"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AddUserForm;
