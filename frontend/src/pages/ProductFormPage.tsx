import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createProduct,
  fetchProduct,
  updateProduct,
  type CreateProductPayload,
} from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TAX_RATES = [0, 5, 8, 10] as const;

const productSchema = z.object({
  sku: z
    .string()
    .min(1, 'Mã SKU bắt buộc')
    .max(100, 'SKU tối đa 100 ký tự')
    .regex(/^[A-Z0-9\-_]+$/i, 'SKU chỉ được chứa chữ, số, dấu - và _'),
  name: z.string().min(1, 'Tên sản phẩm bắt buộc').max(255, 'Tên tối đa 255 ký tự'),
  priceVnd: z
    .number({ invalid_type_error: 'Giá phải là số nguyên' })
    .int('Giá là số nguyên đồng')
    .min(0, 'Giá không được âm'),
  taxRatePercent: z.coerce.number().refine((v): v is 0 | 5 | 8 | 10 => TAX_RATES.includes(v as 0 | 5 | 8 | 10), {
    message: 'Thuế suất phải là 0, 5, 8 hoặc 10',
  }),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductFormPage() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id!),
    enabled: isEdit,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { priceVnd: 0, taxRatePercent: 10 },
  });

  // Populate form when editing
  useEffect(() => {
    if (existing) {
      reset({
        sku: existing.sku,
        name: existing.name,
        priceVnd: existing.priceVnd,
        taxRatePercent: existing.taxRatePercent as 0 | 5 | 8 | 10,
      });
    }
  }, [existing, reset]);

  const createMutation = useMutation({
    mutationFn: (data: CreateProductPayload) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/products', { replace: true });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Omit<ProductFormData, 'sku'>) => updateProduct(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      navigate('/products', { replace: true });
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (isEdit) {
        // sku is immutable — omit from update payload
        const { sku: _sku, ...updateData } = data;
        void _sku;
        await updateMutation.mutateAsync(updateData);
      } else {
        await createMutation.mutateAsync(data as CreateProductPayload);
      }
    } catch (err: unknown) {
      const resp = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      if (typeof resp === 'string' && resp.toLowerCase().includes('sku')) {
        setError('sku', { message: 'Mã SKU đã tồn tại trong cửa hàng' });
      } else {
        setError('root', { message: resp ?? 'Có lỗi xảy ra. Vui lòng thử lại.' });
      }
    }
  };

  if (isEdit && loadingExisting) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-lg mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/products')}>
            ← Quay lại
          </Button>
          <h1 className="text-xl font-semibold">
            {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{isEdit ? existing?.name : 'Thông tin sản phẩm'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              {/* SKU — read-only in edit mode (BR-PROD-05) */}
              <div className="space-y-2">
                <Label htmlFor="sku">
                  Mã SKU{' '}
                  {isEdit && <span className="text-xs text-muted-foreground">(không thể đổi)</span>}
                </Label>
                <Input
                  id="sku"
                  placeholder="SKU-001"
                  readOnly={isEdit}
                  className={isEdit ? 'bg-gray-50 cursor-not-allowed' : ''}
                  {...register('sku')}
                  aria-invalid={!!errors.sku}
                />
                {errors.sku && (
                  <p className="text-sm text-red-600" role="alert">{errors.sku.message}</p>
                )}
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Tên sản phẩm</Label>
                <Input
                  id="name"
                  placeholder="Bánh mì thịt"
                  {...register('name')}
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="text-sm text-red-600" role="alert">{errors.name.message}</p>
                )}
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="priceVnd">Giá bán (đồng)</Label>
                <Input
                  id="priceVnd"
                  type="number"
                  min={0}
                  step={1}
                  placeholder="25000"
                  {...register('priceVnd', { valueAsNumber: true })}
                  aria-invalid={!!errors.priceVnd}
                />
                {errors.priceVnd && (
                  <p className="text-sm text-red-600" role="alert">{errors.priceVnd.message}</p>
                )}
              </div>

              {/* Tax rate */}
              <div className="space-y-2">
                <Label htmlFor="taxRatePercent">Thuế suất VAT</Label>
                <Select id="taxRatePercent" {...register('taxRatePercent')}>
                  {TAX_RATES.map((r) => (
                    <option key={r} value={r}>
                      {r}%
                    </option>
                  ))}
                </Select>
                {errors.taxRatePercent && (
                  <p className="text-sm text-red-600" role="alert">{errors.taxRatePercent.message}</p>
                )}
              </div>

              {errors.root && (
                <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2" role="alert">
                  {errors.root.message}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/products')}
                  disabled={isSubmitting}
                >
                  Huỷ
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
