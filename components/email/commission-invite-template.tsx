import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'

interface CommissionInviteEmailProps {
  inviteUrl: string
  recipientEmail: string
}

export const CommissionInviteEmail = ({
  inviteUrl,
  recipientEmail,
}: CommissionInviteEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Invito a partecipare alla commissione Certifica</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Invito Commissione Certifica</Heading>
          <Text style={text}>
            Sei stato invitato a far parte della commissione di Certifica.
          </Text>
          <Text style={text}>
            Per accettare l'invito e creare il tuo account, clicca sul link seguente:
          </Text>
          <Link href={inviteUrl} style={button}>
            Accetta Invito
          </Link>
          <Text style={footer}>
            Se non hai richiesto questo invito, puoi ignorare questa email.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
}

const text = {
  color: '#444',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 20px',
}

const button = {
  backgroundColor: '#007ee6',
  borderRadius: '4px',
  color: '#fff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '42px',
  textAlign: 'center' as const,
  textDecoration: 'none',
  padding: '0 20px',
}

const footer = {
  color: '#898989',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '20px 0',
} 