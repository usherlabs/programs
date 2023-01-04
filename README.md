<div align="center">
  <h1>Usher Programs</h1>
</div>

<div align="center">
  <strong>Embed Partner Programs and Data Collection</strong>
</div>

<div align="center">
  Accelerate your partner management processes with technology integrated into blockchains and decentralised data networks, capable of facilitating link sharing processes that culminate in conversion tracking and automatic reward distribution.
</div>
<br/>

![Usher Banner](https://lh3.googleusercontent.com/fife/AAbDypCRXxfgnFwaJrW_IrfHGoLSooabi9W3W8DxVD3f5b5A9c3jLKNfNuR57j_-uGoccVqdpTy8cV37sdLx8UVz3BfcfgTnQ6xz7qXf4A6F2x1n1kVAARMs3id7j3XQuao6Q-OT1DtrDlEpR1Eq1-1L5XNH-pxb3Pcueu4ykFMbx88Yyek6o8yU9B1l8ozi88YIlEFDmBds9q9ac-TAsF-7JXNjhig1pWRzGY81qi5FNxsqm_o21HPWJbk1dRpArAtgEyBBbmGErd4MUg8eOePeKO0AOlXJzhfSYh63ejqPFeHePrUzNzEitA1sbuNqxGTuGvCmiDKeTjsB8ojn63dni71PqxgAXSNkK3SA0de7PsaEfLJlI8DjDXT_zPgmA7EpBdg_gClm5WQIoDMFM7V4jMi6E5rK7-y2JrkW15O023zd28-SmEZEvyVrLKPzM0tNvl5dH53sBdOHUBJpsBG-VRP70PPNmgu6kbdrXnUHi125mMe2NnYYe9PVy2BM8FlFnnRf23xISfWt-tiwab9WC-hl3rTRdLOacEKiRGLWyp7Aq6zIQLbktVjJ6CUu8Pc2UB9yUs74tHaajG4zrIh49WZ_ib6ne7wrxqAjKvjI8uvvD6cM_sxKCcd-3qP2t-eDX__tzTA74cr-36xhipwxPjnUABk95lgNCxoiDktWzsttj4QpZmxhVQLi1LL2f_2KWHhCUmuuvsEXcyzotTQwz3MB--cmS5CaNXPPysi94qh0qo3Kqlk7H_IjFsgFrLWh1PvH5l86R-IIqq75jp0KfVcrwM5M5ENaYDpoUDxEsiHiVBOAcRG9ibz-ADL6uqVAwySu3jtVjLvoROYwtumtoMTsrLGydZPnfDj2KqHZzzg1wxD1bjEXktZDvxpF9GCs-jxFxCL3UZ43wrwhmsIZvcI2Iu1ynrlUAPo0bOpgU8VtZ2fKCGBiRuc-dIef91OZdPxUkqsZNWng-fi6XC36EmgjvbdAX8WpiKmzlTDSvJJlQmWajtMHa-Ir_temeBRzdWzctK1sB5gOHM08yYVzedex2tf95CnEmi2FPWAmtFvhXxwjXFvYBITVdxE7u3y45tUmA-QG1WgGaucnyERY4akrlNvEFroqNcP8areTqLWTq7sYIwtRiP4uclbIyRsQkFpJa3j5Dh_OeSHgSJxDudVpVXECK_EKkgIAoC6ZkR9KrS916_K_pHIyy20xbn_Zerha6mcIXod33TSzE8NeMf8VGbA9DHvYRMSwQCOTNlIe1yzkipJbbizIE5P9H0e0qb7W3i_EOE5EkVKQyelQt9I-VSpXIay5QYGCMTCFN9dJu1Bq7FGAIjNLC3RKWm3HOgrp-GoClYiKcI5RTUL6AVqqXGczCs2sDYIfgj0q0eCTVOWe2vL8H3RdHi0Ouah2SW8iGQfNrG9i10EVwpNccPDK_1Xv6FJFVyfdEMJ8SesMpMq8Ypkqc57tNzJPaX15ciyj1CSDwh1hm4DCxq5nNnDQq5qTulOzOtqqGHgUVWnySia5Y-JMcwvhO3IRbhWXXyDsc-NcxqbyqzhnMbehbFh6JF4=w1920-h1005)

<div align="center">
   <a href="https://www.usher.so">Website</a>
   <span> | </span>
   <a href="https://docs.usher.so">Docs</a>
   <span> | </span>
   <a href="https://go.usher.so/discord">Discord</a>
   <span> | </span>
   <a href="https://go.usher.so/twitter">Twitter</a>
</div>

# Programs

**Programs** is a monorepo containing the packages necessary to integrate Usher's partner programs & data collection technology into a new dApp or software environment.
These features include:

- Authentication
- Link sharing over decentralised data
- Wallet connections
- Affiliate marketing campaigns with crypto rewards

> **Project Status**
> Usher is live and ready to accept newly created campaigns whereby rewards can be distributed to partners that refer people to the campaign's configured destination URL. Campaigns can also include reference to Smart Contract events, whereby wallets can be connected upon invite link visits, and then tracked as referred users when their associated wallet triggers a tracked Smart Contract events.
> **Upcoming changes**
> Usher is preparing a new release where the link sharing and conversion tracking features can be used exclusively for data collection and insights. While affiliate marketing automatic reward distribution can still be associated to conversions, Usher is evolving the user expeirence to offer value through insights.

## Packages

| Name         | Package                                                                       | Description                                                                                                                                  |
| ------------ | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth         | [@usher.so/auth](/usherlabs/programs/tree/main/packages/auth)                 | Produce an authenticated DID using a wallet connection like Metamask, ArConnect, etc. and interface with the Ceramic Network or Usher's APIs |
| Campaigns    | [@usher.so/campaigns](/usherlabs/programs/tree/main/packages/campaigns)       | Create your own Usher Campaigns directly within your dApp                                                                                    |
| Partnerships | [@usher.so/partnerships](/usherlabs/programs/tree/main/packages/partnerships) | Manage your users' partnerships with a Campaign                                                                                              |
| Shared       | [@usher.so/shared](/usherlabs/programs/tree/main/packages/shared)             | A package shared throughout the Usher codebase.                                                                                              |
| CLI          | [@usher.so/cli](/usherlabs/programs/tree/main/packages/cli)                   | Manage your Usher Campaigns directly from your Terminal                                                                                      |

> To learn more about each individual package, navigate to the relevant package folder.

## Quick start

Learn the basics by creating a new Camapign and indexing it on Usher with the Usher CLI. [CLI guide →](https://developers.ceramic.network/build/quick-start/)

## Installation and usage

Full documentation on installation and usage can be found on the [Usher documentation site →](https://docs.usher.so/)

## Troubleshooting

- For questions, support, and discussions: [Join the Usher Discord](https://go.usher.so/discord)
- For bugs and feature requests: [Create an issue on Github](https://github.com/usherlabs/programs/issues)

## Contributing

We are happy to accept small and large contributions, feel free to make a suggestion or submit a pull request.

This monorepo is managed with [Nx](https://nx.dev).

### Building the Repo

Run `yarn build` or `npx nx build <package_name>` to build the library.

## Maintainers

- rsoury ([@rsoury](https://github.com/rsoury))
- victorshevtsov ([@victorshevtsov](https://github.com/victorshevtsov))

## License

Fully open source and licensed under MIT.
