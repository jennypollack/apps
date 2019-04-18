import React from 'react';
import { Link } from 'react-router-dom';
import { Box } from 'grommet';
import { Section } from '@centrifuge/axis-section';
import { LabelValuePair } from '../../common/interfaces';
import { Invoice } from '../../common/models/invoice';
import { DisplayField } from '../../components/DisplayField';

interface RecipientProps {
  invoice: Invoice;
  contacts: LabelValuePair[];
  columnGap: string
};


export class Recipient extends React.Component<RecipientProps> {
  displayName = 'Recipient';

  render() {

    const {
      invoice,
      contacts,
      columnGap,
    } = this.props;

    const recipientName = contacts.filter(contact =>
      contact.value === invoice!.recipient,
    ).map(contact => contact.label).shift();

    return (
      <Box direction="row" gap={columnGap} basis={'1/2'}>
        <Box gap={columnGap} basis={'1/2'}>
          <DisplayField
            label="Centrifuge ID"
            value={recipientName}
          />
          <DisplayField
            label="Company name"
            value={invoice!.bill_to_company_name}
          />
        </Box>
        <Box gap={columnGap} basis={'1/2'}>
          <DisplayField
            label="Street"
            value={invoice!.bill_to_street1}
          />
          <DisplayField
            label="Street"
            value={invoice!.bill_to_street2}
          />
          <DisplayField
            label="City"
            value={invoice!.bill_to_city}
          />
          <DisplayField
            label="Country"
            value={invoice!.bill_to_country}
          />
          <DisplayField
            label="ZIP code"
            value={invoice!.bill_to_zipcode}
          />
        </Box>
      </Box>
    );

  }
}

