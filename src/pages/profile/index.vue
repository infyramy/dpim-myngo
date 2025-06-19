<template>
  <div class="container mx-auto p-4 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Profil Pengguna</h1>
        <p class="text-muted-foreground mt-1">Urus maklumat peribadi anda</p>
      </div>

      <Button
        v-if="!isEditing"
        @click="isEditing = true"
        class="flex items-center gap-2"
      >
        <PencilIcon class="h-4 w-4" />
        Edit Profil
      </Button>
      <div v-else class="flex gap-2">
        <Button variant="outline" @click="isEditing = false"> Batal </Button>
        <Button @click="saveProfile" class="flex items-center gap-2">
          <SaveIcon class="h-4 w-4" />
          Simpan
        </Button>
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Maklumat Peribadi</CardTitle>
        <CardDescription>Kemaskini maklumat peribadi anda</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div
          class="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6"
        >
          <Avatar class="h-24 w-24">
            <AvatarImage src="/avatars/user-placeholder.jpg" alt="User" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div class="space-y-1">
            <h3 class="text-xl font-medium">John Doe</h3>
            <p class="text-muted-foreground">johndoe@example.com</p>
            <p class="text-sm text-muted-foreground">
              Didaftarkan pada 15 Jun 2023
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label for="fullName">Nama Penuh</Label>
            <Input id="fullName" value="John Doe" disabled class="mt-1" />
          </div>
          <div>
            <Label for="ic">Nombor IC</Label>
            <Input id="ic" value="901234-56-7890" disabled class="mt-1" />
          </div>
          <div>
            <Label for="email">Emel</Label>
            <Input
              id="email"
              value="johndoe@example.com"
              disabled
              class="mt-1"
            />
          </div>
          <div>
            <Label for="phone">Nombor Telefon</Label>
            <Input id="phone" value="011-2345-6789" disabled class="mt-1" />
          </div>
          <div class="md:col-span-2">
            <Label for="address">Alamat</Label>
            <Textarea
              id="address"
              :disabled="!isEditing"
              class="mt-1"
              value="123 Jalan Sample, Taman Sample, 50000 Kuala Lumpur, Malaysia"
            />
          </div>
          <div>
            <Label for="state">Negeri</Label>
            <Select :disabled="!isEditing">
              <SelectTrigger id="state" class="w-full mt-1">
                <SelectValue placeholder="Pilih negeri" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="selangor">Selangor</SelectItem>
                <SelectItem value="kl">Kuala Lumpur</SelectItem>
                <SelectItem value="johor">Johor</SelectItem>
                <SelectItem value="penang">Pulau Pinang</SelectItem>
                <SelectItem value="other">Lain-lain</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label for="postcode">Poskod</Label>
            <Input
              id="postcode"
              value="50000"
              :disabled="!isEditing"
              class="mt-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Tetapan Akaun</CardTitle>
        <CardDescription>Urus tetapan privasi dan notifikasi</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium">Notifikasi Emel</h4>
              <p class="text-sm text-muted-foreground">
                Terima notifikasi melalui emel
              </p>
            </div>
            <Switch :disabled="!isEditing" />
          </div>
          <Separator />
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium">Notifikasi SMS</h4>
              <p class="text-sm text-muted-foreground">
                Terima notifikasi melalui SMS
              </p>
            </div>
            <Switch :disabled="!isEditing" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { PencilIcon, SaveIcon } from "lucide-vue-next";

const isEditing = ref(false);

const saveProfile = () => {
  // Placeholder for save functionality
  isEditing.value = false;
};
</script>
