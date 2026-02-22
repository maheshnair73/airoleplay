import React, { useState, useEffect } from 'react';
import { Lead } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

export default function LeadForm({ open, onOpenChange, onLeadAdded }) {
  const [lead, setLead] = useState({
    company_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    product_interest: '',
    lead_source: 'website',
    status: 'new',
    assigned_to_email: ''
  });
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      const userList = await User.list().catch(() => []);
      setUsers(userList);
    }
    fetchUsers();
  }, []);

  const handleChange = (field, value) => {
    setLead(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await Lead.create(lead);
      onLeadAdded();
      onOpenChange(false);
      setLead({ company_name: '', contact_name: '', contact_email: '', contact_phone: '', product_interest: '', lead_source: 'website', status: 'new', assigned_to_email: '' });
    } catch (error) {
      console.error("Error creating lead:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>
            Fill in the details for the new lead.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <Input placeholder="Contact Name" value={lead.contact_name} onChange={(e) => handleChange('contact_name', e.target.value)} required />
          <Input placeholder="Company Name" value={lead.company_name} onChange={(e) => handleChange('company_name', e.target.value)} required />
          <Input type="email" placeholder="Contact Email" value={lead.contact_email} onChange={(e) => handleChange('contact_email', e.target.value)} required />
          <Input placeholder="Contact Phone" value={lead.contact_phone} onChange={(e) => handleChange('contact_phone', e.target.value)} />
          <Input placeholder="Product/Service Interest" value={lead.product_interest} onChange={(e) => handleChange('product_interest', e.target.value)} />
          <Select value={lead.lead_source} onValueChange={(value) => handleChange('lead_source', value)}>
            <SelectTrigger><SelectValue placeholder="Lead Source" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="cold_outreach">Cold Outreach</SelectItem>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="advertising">Advertising</SelectItem>
            </SelectContent>
          </Select>
          <Select value={lead.assigned_to_email} onValueChange={(value) => handleChange('assigned_to_email', value)}>
            <SelectTrigger><SelectValue placeholder="Assign to" /></SelectTrigger>
            <SelectContent>
              {users.map(user => <SelectItem key={user.id} value={user.email}>{user.full_name || user.email}</SelectItem>)}
            </SelectContent>
          </Select>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">{isLoading ? 'Saving...' : 'Save Lead'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}