'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  MessageCircle, 
  Phone,
  Mail,
  MapPin,
  Star,
  UserCheck,
  UserX,
  RefreshCw
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface DemoContact {
  id: string;
  name: string;
  avatar: string;
  status: string;
  lastSeen: string;
  phone?: string;
  email?: string;
  location?: string;
  isFavorite: boolean;
  isBlocked: boolean;
  messageCount: number;
  relationshipType: 'friend' | 'family' | 'colleague' | 'acquaintance';
}

export default function DemoContactsPage() {
  const [contacts, setContacts] = useState<DemoContact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<DemoContact | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'favorites' | 'blocked' | 'family' | 'friends'>('all');

  const [newContact, setNewContact] = useState({
    name: '',
    avatar: '',
    status: '',
    phone: '',
    email: '',
    location: '',
    relationshipType: 'friend' as const
  });

  // Demo data initialization
  useEffect(() => {
    const demoContacts: DemoContact[] = [
      {
        id: '1',
        name: 'Rajesh Kumar',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rajesh',
        status: 'Engineering manager at TCS, loves cricket and tech!',
        lastSeen: '5 minutes ago',
        phone: '+91 98765 43210',
        email: 'rajesh.kumar@email.com',
        location: 'Bangalore, Karnataka',
        isFavorite: true,
        isBlocked: false,
        messageCount: 156,
        relationshipType: 'colleague'
      },
      {
        id: '2',
        name: 'Priya Sharma',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
        status: 'Dancing through life! 💃 Bollywood enthusiast',
        lastSeen: '2 hours ago',
        phone: '+91 87654 32109',
        email: 'priya.sharma@email.com',
        location: 'Mumbai, Maharashtra',
        isFavorite: true,
        isBlocked: false,
        messageCount: 89,
        relationshipType: 'friend'
      },
      {
        id: '3',
        name: 'Amit Patel',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amit',
        status: 'Startup founder | Coffee addict ☕',
        lastSeen: '1 day ago',
        phone: '+91 76543 21098',
        email: 'amit@startup.com',
        location: 'Delhi, India',
        isFavorite: false,
        isBlocked: false,
        messageCount: 34,
        relationshipType: 'colleague'
      },
      {
        id: '4',
        name: 'Sneha Reddy',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sneha',
        status: 'Sister from another mister 👭 Family time!',
        lastSeen: '10 minutes ago',
        phone: '+91 65432 10987',
        email: 'sneha.family@email.com',
        location: 'Hyderabad, Telangana',
        isFavorite: true,
        isBlocked: false,
        messageCount: 298,
        relationshipType: 'family'
      },
      {
        id: '5',
        name: 'Blocked User',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=blocked',
        status: 'This user has been blocked',
        lastSeen: '1 week ago',
        phone: '+91 54321 09876',
        email: 'blocked@example.com',
        location: 'Unknown',
        isFavorite: false,
        isBlocked: true,
        messageCount: 12,
        relationshipType: 'acquaintance'
      }
    ];

    setTimeout(() => {
      setContacts(demoContacts);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.phone?.includes(searchTerm) ||
                         contact.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'favorites' && contact.isFavorite) ||
      (filterType === 'blocked' && contact.isBlocked) ||
      (filterType === 'family' && contact.relationshipType === 'family') ||
      (filterType === 'friends' && contact.relationshipType === 'friend');

    return matchesSearch && matchesFilter;
  });

  const handleAddContact = () => {
    const contact: DemoContact = {
      id: Date.now().toString(),
      ...newContact,
      lastSeen: 'Just added',
      isFavorite: false,
      isBlocked: false,
      messageCount: 0
    };

    setContacts(prev => [contact, ...prev]);
    setNewContact({
      name: '',
      avatar: '',
      status: '',
      phone: '',
      email: '',
      location: '',
      relationshipType: 'friend'
    });
    setIsDialogOpen(false);
    toast.success('Contact added successfully! 👥');
  };

  const handleToggleFavorite = (contactId: string) => {
    setContacts(prev => prev.map(contact => 
      contact.id === contactId 
        ? { ...contact, isFavorite: !contact.isFavorite }
        : contact
    ));
    toast.success('Favorite status updated!');
  };

  const handleToggleBlock = (contactId: string) => {
    setContacts(prev => prev.map(contact => 
      contact.id === contactId 
        ? { ...contact, isBlocked: !contact.isBlocked }
        : contact
    ));
    toast.success('Block status updated!');
  };

  const handleDeleteContact = (contactId: string) => {
    setContacts(prev => prev.filter(contact => contact.id !== contactId));
    toast.success('Contact deleted successfully!');
  };

  const getRelationshipColor = (type: string) => {
    switch (type) {
      case 'family': return 'bg-red-100 text-red-800';
      case 'friend': return 'bg-blue-100 text-blue-800';
      case 'colleague': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            Demo Contacts Management
          </h1>
          <p className="text-gray-600 mt-2">Manage demo contacts for testing chat functionality</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
              <DialogDescription>Create a new demo contact for testing</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="contact-name">Name</Label>
                <Input
                  id="contact-name"
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  placeholder="Enter contact name"
                />
              </div>
              <div>
                <Label htmlFor="contact-avatar">Avatar URL (optional)</Label>
                <Input
                  id="contact-avatar"
                  value={newContact.avatar}
                  onChange={(e) => setNewContact({...newContact, avatar: e.target.value})}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              <div>
                <Label htmlFor="contact-status">Status</Label>
                <Textarea
                  id="contact-status"
                  value={newContact.status}
                  onChange={(e) => setNewContact({...newContact, status: e.target.value})}
                  placeholder="What's on their mind?"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="contact-phone">Phone</Label>
                  <Input
                    id="contact-phone"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <Label htmlFor="relationship">Relationship</Label>
                  <select
                    id="relationship"
                    value={newContact.relationshipType}
                    onChange={(e) => setNewContact({...newContact, relationshipType: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="friend">Friend</option>
                    <option value="family">Family</option>
                    <option value="colleague">Colleague</option>
                    <option value="acquaintance">Acquaintance</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleAddContact} className="w-full">
                Add Contact
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Favorites</p>
                <p className="text-2xl font-bold text-yellow-600">{contacts.filter(c => c.isFavorite).length}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Family</p>
                <p className="text-2xl font-bold text-red-600">{contacts.filter(c => c.relationshipType === 'family').length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blocked</p>
                <p className="text-2xl font-bold text-gray-600">{contacts.filter(c => c.isBlocked).length}</p>
              </div>
              <UserX className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search contacts by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'favorites', 'friends', 'family', 'blocked'].map((filter) => (
                <Button
                  key={filter}
                  variant={filterType === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType(filter as any)}
                  className="capitalize"
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => (
          <Card key={contact.id} className={`${contact.isBlocked ? 'border-red-200 bg-red-50' : ''} hover:shadow-md transition-shadow`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={contact.avatar} alt={contact.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {contact.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                    <p className="text-sm text-gray-500">{contact.lastSeen}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {contact.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                  {contact.isBlocked && <UserX className="h-4 w-4 text-red-500" />}
                </div>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{contact.status}</p>
              
              <div className="space-y-2 mb-4">
                {contact.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone className="h-3 w-3" />
                    {contact.phone}
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="h-3 w-3" />
                    {contact.email}
                  </div>
                )}
                {contact.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="h-3 w-3" />
                    {contact.location}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={getRelationshipColor(contact.relationshipType)}>
                    {contact.relationshipType}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {contact.messageCount} msgs
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleFavorite(contact.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Star className={`h-4 w-4 ${contact.isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleBlock(contact.id)}
                    className="h-8 w-8 p-0"
                  >
                    <UserX className={`h-4 w-4 ${contact.isBlocked ? 'text-red-500' : 'text-gray-400'}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteContact(contact.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No contacts found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search terms.' : 'Add some demo contacts to get started.'}
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Contact
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}