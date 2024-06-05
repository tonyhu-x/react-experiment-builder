# React experiment builder

Online experiment builder using React.

## Rationale

This project was born out of another project I was working on --- a linguistics study
for which I decided to set up the experiment and data collection online.
Many platforms already exist for this purpose, such as [Gorilla](https://gorilla.sc)
and [PCIbex](https://farm.pcibex.net).
However, many of these platforms are designed around visual editing. In those that
do offer a ccoding-based approach, the APIs are often clunky to use and not flexible
enough to enable more intricate designs and entensibility.
For this reason, I decided to start from scratch and build my experiment using React.
This project aims to provide a library of React components that simplfy the setup of
computer-based experiments and work for a variety of data storage scenarios,
whether you want to do everything locally or have a fully fledged server backend like
AWS.