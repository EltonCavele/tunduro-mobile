import { Text } from 'components/app/Text';
import { useDeferredValue, useMemo, useState } from 'react';

import { useRouter } from 'expo-router';
import { Button, SearchField } from 'heroui-native';
import { ArrowLeft, Mail, Trash2, UserPlus, UsersRound } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';

import { AppScreenLoader } from 'components/app/AppScreenLoader';
import { SafeAreaView } from 'components/app/SafeAreaView';
import {
  useDeleteUserContactMutation,
  useInviteUserContactMutation,
} from 'hooks/useUserContactMutations';
import { useUserContactsQuery } from 'hooks/useUserContactsQuery';
import { useUserSearchQuery } from 'hooks/useUserSearchQuery';
import { getUserDisplayName } from 'lib/auth-utils';
import { getErrorMessage } from 'lib/error-utils';
import type { UserProfile } from 'lib/auth.types';
import type { UserContact } from 'services/user.service';

export function FriendsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedQuery = deferredSearchQuery.trim();
  const normalizedEmail = searchQuery.trim().toLowerCase();
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

  const allContactsQuery = useUserContactsQuery('');
  const contactsQuery = useUserContactsQuery(normalizedQuery);
  const usersQuery = useUserSearchQuery(normalizedQuery, {
    enabled: normalizedQuery.length >= 2,
  });
  const inviteContactMutation = useInviteUserContactMutation();
  const deleteContactMutation = useDeleteUserContactMutation();

  const allContacts = useMemo(() => allContactsQuery.data ?? [], [allContactsQuery.data]);
  const contacts = useMemo(() => contactsQuery.data ?? [], [contactsQuery.data]);
  const contactEmails = useMemo(
    () => new Set(allContacts.map((contact) => contact.email.toLowerCase())),
    [allContacts]
  );
  const users = useMemo(
    () => (usersQuery.data ?? []).filter((user) => !contactEmails.has(user.email.toLowerCase())),
    [contactEmails, usersQuery.data]
  );
  const canInviteEmail = isValidEmail && !contactEmails.has(normalizedEmail);
  const isInitialLoading = allContactsQuery.isLoading && allContacts.length === 0;

  async function handleAddUser(user: UserProfile) {
    try {
      setErrorMessage('');
      await inviteContactMutation.mutateAsync({
        displayName: getUserDisplayName(user),
        email: user.email,
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Não foi possível adicionar este amigo.'));
    }
  }

  async function handleInviteEmail() {
    if (!canInviteEmail) {
      return;
    }

    try {
      setErrorMessage('');
      await inviteContactMutation.mutateAsync({ email: normalizedEmail });
      setSearchQuery('');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Não foi possível enviar o convite.'));
    }
  }

  async function handleDeleteContact(contactId: string) {
    try {
      setErrorMessage('');
      await deleteContactMutation.mutateAsync(contactId);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Não foi possível apagar este amigo.'));
    }
  }

  if (isInitialLoading) {
    return <AppScreenLoader message="A carregar amigos..." />;
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-5 py-3">
        <Pressable
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-full"
          onPress={() => router.back()}>
          <ArrowLeft color="#18181B" size={20} />
        </Pressable>

        <Text className="font-title text-[18px] text-[#18181B]">Amigos</Text>

        <View className="h-10 w-10" />
      </View>

      <ScrollView
        contentContainerClassName="px-5 pb-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <SearchField className="mb-5" value={searchQuery} onChange={setSearchQuery}>
          <SearchField.Group className="rounded-[20px] bg-[#F1F2F4]">
            <SearchField.SearchIcon iconProps={{ color: '#71727A', size: 18 }} />
            <SearchField.Input
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Nome ou email"
              placeholderColorClassName="text-[#8F9099]"
              variant="secondary"
            />
          </SearchField.Group>
        </SearchField>

        {errorMessage ? (
          <Text className="mb-4 text-[13px] text-[#D05B5B]">{errorMessage}</Text>
        ) : null}

        {canInviteEmail ? (
          <Button
            className="mb-5 rounded-full bg-primary"
            feedbackVariant="none"
            isDisabled={inviteContactMutation.isPending}
            onPress={() => void handleInviteEmail()}>
            <Mail size={18} stroke="#101010" strokeWidth={2.2} />
            <Button.Label className="font-button text-[14px] text-[#101010]">
              Convidar por email
            </Button.Label>
          </Button>
        ) : null}

        {users.length > 0 ? (
          <View className="mb-6">
            <Text className="mb-3 font-title text-[16px] text-[#18181B]">Pessoas no app</Text>
            {users.map((user) => (
              <FriendSearchRow
                key={user.id}
                isLoading={inviteContactMutation.isPending}
                onAdd={() => void handleAddUser(user)}
                user={user}
              />
            ))}
          </View>
        ) : null}

        <View>
          <View className="mb-3 flex-row items-center">
            <UsersRound size={18} stroke="#1B3022" strokeWidth={2.2} />
            <Text className="ml-2 font-title text-[16px] text-[#18181B]">Meus amigos</Text>
          </View>

          {contactsQuery.isLoading ? (
            <View className="py-8">
              <Text className="text-center text-[14px] text-[#6D6D6D]">A pesquisar...</Text>
            </View>
          ) : contacts.length === 0 ? (
            <View className="py-8">
              <Text className="text-center text-[14px] text-[#6D6D6D]">
                Pesquisa pelo nome ou email.
              </Text>
            </View>
          ) : (
            contacts.map((contact) => (
              <FriendContactRow
                contact={contact}
                key={contact.id}
                onDelete={() => void handleDeleteContact(contact.id)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FriendSearchRow({
  isLoading,
  onAdd,
  user,
}: {
  isLoading: boolean;
  onAdd: () => void;
  user: UserProfile;
}) {
  return (
    <View className="flex-row items-center border-b border-[#EFEFEF] py-4">
      <View className="h-11 w-11 items-center justify-center rounded-full bg-primary">
        <Text className="font-button text-[15px] text-[#101010]">
          {getUserDisplayName(user).slice(0, 1).toUpperCase()}
        </Text>
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-[15px] font-semibold text-[#171717]">{getUserDisplayName(user)}</Text>
        <Text className="mt-0.5 text-[13px] text-[#7A7A7A]">{user.email}</Text>
      </View>
      <Button className="rounded-full bg-[#F1F2F4]" isDisabled={isLoading} onPress={onAdd}>
        <UserPlus size={16} stroke="#101010" strokeWidth={2.2} />
        <Button.Label className="font-button text-[13px] text-[#101010]">Adicionar</Button.Label>
      </Button>
    </View>
  );
}

function FriendContactRow({ contact, onDelete }: { contact: UserContact; onDelete: () => void }) {
  const linkedName = contact.linkedUser ? getUserDisplayName(contact.linkedUser) : '';
  const displayName = contact.displayName?.trim() || linkedName || contact.email;

  return (
    <View className="flex-row items-center border-b border-[#EFEFEF] py-4">
      <View className="h-11 w-11 items-center justify-center rounded-full bg-[#F1F2F4]">
        <Text className="font-button text-[15px] text-[#101010]">
          {displayName.slice(0, 1).toUpperCase()}
        </Text>
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-[15px] font-semibold text-[#171717]">{displayName}</Text>
        <Text className="mt-0.5 text-[13px] text-[#7A7A7A]">{contact.email}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        className="h-10 w-10 items-center justify-center rounded-full bg-[#FFF1F1]"
        onPress={onDelete}>
        <Trash2 size={17} stroke="#D05B5B" strokeWidth={2.1} />
      </Pressable>
    </View>
  );
}
