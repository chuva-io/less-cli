export default function validate_static_domain_name(domainName) {
  if (
    !domainName ||
    !/^(?!https?:\/\/)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domainName)
  ) {
    throw new Error('The customDomain must satisfy regular expression pattern: (?!https?:\/\/)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
  }
}
