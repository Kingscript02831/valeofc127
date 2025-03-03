
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import type { Profile } from "../types/profile";
import { useState } from "react";

interface EditProfileDialogProps {
  profile: Profile | null;
  onSubmit: (values: Partial<Profile>) => Promise<void>;
}

const EditProfileDialog = ({ profile, onSubmit }: EditProfileDialogProps) => {
  const [values, setValues] = useState<Partial<Profile>>(
    profile ? {
      full_name: profile.full_name || '',
      username: profile.username || '',
      bio: profile.bio || '',
      website: profile.website || '',
      instagram_url: profile.instagram_url || '',
      city: profile.city || '',
      status: profile.status || '',
      relationship_status: profile.relationship_status || null,
      birth_date: profile.birth_date ? new Date(profile.birth_date).toISOString().split('T')[0] : '',
    } : {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Editar perfil</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="full_name" className="text-right">
              Nome
            </Label>
            <Input
              id="full_name"
              name="full_name"
              value={values.full_name || ''}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              name="username"
              value={values.username || ''}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Input
              id="status"
              name="status"
              value={values.status || ''}
              onChange={handleChange}
              className="col-span-3"
              placeholder="O que você está pensando?"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="bio" className="text-right">
              Bio
            </Label>
            <Textarea
              id="bio"
              name="bio"
              value={values.bio || ''}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="city" className="text-right">
              Cidade
            </Label>
            <Input
              id="city"
              name="city"
              value={values.city || ''}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="relationship_status" className="text-right">
              Status de Relacionamento
            </Label>
            <Select
              value={values.relationship_status || ''}
              onValueChange={(value) => handleSelectChange('relationship_status', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Solteiro(a)</SelectItem>
                <SelectItem value="dating">Namorando</SelectItem>
                <SelectItem value="widowed">Viúvo(a)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="birth_date" className="text-right">
              Data de Nascimento
            </Label>
            <Input
              id="birth_date"
              name="birth_date"
              type="date"
              value={values.birth_date || ''}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="website" className="text-right">
              Website
            </Label>
            <Input
              id="website"
              name="website"
              value={values.website || ''}
              onChange={handleChange}
              className="col-span-3"
              placeholder="https://exemplo.com"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="instagram_url" className="text-right">
              Instagram
            </Label>
            <Input
              id="instagram_url"
              name="instagram_url"
              value={values.instagram_url || ''}
              onChange={handleChange}
              className="col-span-3"
              placeholder="https://instagram.com/username"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default EditProfileDialog;
