"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { ProfileDetails, UpdateProfileBody } from "../types";

interface ProfileFormProps {
  value?: ProfileDetails;
  onSubmit?: (data: UpdateProfileBody) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ value, onSubmit }) => {
  const [id, setId] = useState<string>("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (value) {
      setId(value.id);
      setFirstName(value.first_name || "");
      setLastName(value.last_name || "");
      setImageUrl(value.image_url || "");
    }
  }, [value]);

  const handleSubmit = (e: FormEvent) => {
    if (!value) return;
    e.preventDefault();
    onSubmit?.({
      id: id,
      first_name: firstName,
      last_name: lastName,
      image_url: imageUrl,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-md mx-auto">
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          disabled
          type="email"
          value={value?.email}
          className="w-full border rounded p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">First Name</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Last Name</label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Image URL</label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        {value ? "Update Profile" : "Create Profile"}
      </button>
    </form>
  );
};

export default ProfileForm;
