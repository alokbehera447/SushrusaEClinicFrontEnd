import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { investigationService, InvestigationCategory, InvestigationTest } from '@/services/investigationService';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Filter, Search, Loader2 } from 'lucide-react';

interface Props {
  isDarkMode?: boolean;
}

const pageSizeOptions = [10, 20, 50];

const InvestigationTestsManagement: React.FC<Props> = ({ isDarkMode }) => {
  const [categories, setCategories] = useState<InvestigationCategory[]>([]);
  const [allTests, setAllTests] = useState<InvestigationTest[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters & pagination
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string>('all');
  const [isActive, setIsActive] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog state
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<InvestigationTest | null>(null);
  const [form, setForm] = useState({
    name: '',
    code: '',
    category_id: '' as number | string,
    unit: '',
    normal_range: '',
    is_fasting_required: false,
    estimated_cost: '' as number | string,
    is_active: true,
    description: '',
    preparation_instructions: '',
  });

  useEffect(() => {
    (async () => {
      const cats = await investigationService.getCategories();
      setCategories(cats);
    })();
  }, []);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const tests = await investigationService.getTests();
      setAllTests(tests || []);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return allTests.filter(t => {
      if (categoryId !== 'all' && String(t.category?.id || t.category_id) !== String(categoryId)) return false;
      if (isActive !== 'all' && Boolean(t.is_active) !== (isActive === 'true')) return false;
      if (s) {
        const hay = `${t.name || ''} ${t.code || ''}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [allTests, search, categoryId, isActive]);

  const count = filtered.length;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / pageSize)), [count, pageSize]);
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: '', code: '', category_id: '', unit: '', normal_range: '', is_fasting_required: false,
      estimated_cost: '', is_active: true, description: '', preparation_instructions: ''
    });
    setShowForm(true);
  };

  const openEdit = (t: InvestigationTest) => {
    setEditing(t);
    setForm({
      name: t.name || '',
      code: t.code || '',
      category_id: t.category?.id || t.category_id || '',
      unit: t.unit || '',
      normal_range: t.normal_range || '',
      is_fasting_required: !!t.is_fasting_required,
      estimated_cost: t.estimated_cost ?? '',
      is_active: !!t.is_active,
      description: t.description || '',
      preparation_instructions: t.preparation_instructions || '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    const payload: any = {
      name: form.name.trim(),
      code: form.code?.trim() || undefined,
      category_id: form.category_id || undefined,
      unit: form.unit?.trim() || undefined,
      normal_range: form.normal_range?.trim() || undefined,
      is_fasting_required: !!form.is_fasting_required,
      estimated_cost: form.estimated_cost === '' ? undefined : Number(form.estimated_cost),
      is_active: !!form.is_active,
      description: form.description?.trim() || undefined,
      preparation_instructions: form.preparation_instructions?.trim() || undefined,
    };
    if (editing) {
      await investigationService.updateTest(editing.id, payload);
      setShowForm(false);
      // refresh local list
      fetchTests();
      return;
    }
    await investigationService.createTest({ name: payload.name, category_id: payload.category_id });
    setShowForm(false);
    setPage(1);
    fetchTests();
  };

  const handleDelete = async (t: InvestigationTest) => {
    if (!confirm(`Delete test "${t.name}"?`)) return;
    await investigationService.deleteTest(t.id);
    fetchTests();
  };

  

  return (
    <div className="space-y-6">
      <Card className={`border-0 shadow-lg rounded-2xl ${isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Investigation Tests</span>
            <Button onClick={openCreate} className="bg-[#E17726] text-white"><Plus className="w-4 h-4 mr-1" />New Test</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3 items-center mb-4">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input value={search} onChange={e=>{setSearch(e.target.value); setPage(1);}} placeholder="Search by name or code" className="pl-9" />
            </div>
            <Select value={categoryId} onValueChange={(v)=>{setCategoryId(v); setPage(1);}}>
              <SelectTrigger className="w-56"><SelectValue placeholder="All categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map(c=> (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={isActive} onValueChange={(v)=>{setIsActive(v); setPage(1);}}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600">
              <div className="col-span-4">Name</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Code</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[#E17726]" /></div>
            ) : paginated.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-10">No tests found</div>
            ) : (
              <ScrollArea className="max-h-[60vh]">
                {paginated.map(t => (
                  <div key={t.id} className="grid grid-cols-12 px-3 py-2 border-t text-sm items-center">
                    <div className="col-span-4">
                      <div className="font-medium text-midnight truncate">{t.name}</div>
                      {t.unit && <div className="text-xs text-gray-500">Unit: {t.unit}{t.normal_range ? ` • Range: ${t.normal_range}`: ''}</div>}
                    </div>
                    <div className="col-span-2 truncate">{t.category?.name || '-'}</div>
                    <div className="col-span-2 truncate">{t.code || '-'}</div>
                    <div className="col-span-2">
                      <Badge className={t.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}>
                        {t.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="col-span-2 flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={()=>openEdit(t)}><Edit className="w-4 h-4 mr-1" />Edit</Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-300" onClick={()=>handleDelete(t)}><Trash2 className="w-4 h-4 mr-1" />Delete</Button>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            )}
          </div>

          {/* Pagination */}
          {count > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">Showing {(page-1)*pageSize+1}–{Math.min(page*pageSize, count)} of {count}</div>
              <div className="flex items-center gap-2">
                <select className="text-sm border rounded px-2 py-1" value={pageSize} onChange={e=>{setPageSize(Number(e.target.value)); setPage(1);}}>
                  {pageSizeOptions.map(s=> <option key={s} value={s}>{s}/page</option>)}
                </select>
                <Button variant="outline" size="sm" onClick={()=>setPage(1)} disabled={page===1}>First</Button>
                <Button variant="outline" size="sm" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>Prev</Button>
                <div className="text-sm">{page}/{totalPages}</div>
                <Button variant="outline" size="sm" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>Next</Button>
                <Button variant="outline" size="sm" onClick={()=>setPage(totalPages)} disabled={page===totalPages}>Last</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Test' : 'Create Test'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
            </div>
            <div>
              <Label>Code</Label>
              <Input value={form.code} onChange={e=>setForm({...form, code: e.target.value})} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={String(form.category_id || '')} onValueChange={(v)=>setForm({...form, category_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c=> <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Unit</Label>
              <Input value={form.unit} onChange={e=>setForm({...form, unit: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <Label>Normal Range</Label>
              <Input value={form.normal_range} onChange={e=>setForm({...form, normal_range: e.target.value})} />
            </div>
            <div>
              <Label>Estimated Cost</Label>
              <Input type="number" value={String(form.estimated_cost)} onChange={e=>setForm({...form, estimated_cost: e.target.value})} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.is_active ? 'true' : 'false'} onValueChange={(v)=>setForm({...form, is_active: v==='true'})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Input value={form.description} onChange={e=>setForm({...form, description: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <Label>Preparation Instructions</Label>
              <Input value={form.preparation_instructions} onChange={e=>setForm({...form, preparation_instructions: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvestigationTestsManagement;


