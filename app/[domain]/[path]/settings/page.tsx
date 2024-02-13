import EventSettings from '@/app/app/(dashboard)/city/[subdomain]/events/[path]/settings/page'
import { getSubdomainFromDomain } from '@/lib/utils';

export default async function SiteEventSettingsPage({
    params,
  }: {
    params: { path: string; domain: string };
  }) {
    const subdomain = getSubdomainFromDomain( params.domain)

    return <EventSettings params={{ path: params.path, subdomain }} />
}
