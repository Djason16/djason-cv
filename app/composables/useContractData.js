// Provides contract-specific document data with grouped contracts
export const useContractData = props => {
    const result = useDocumentData(props, { groupingStrategy: 'contracts' })
    return { ...result, groupedContracts: result.groupedData }
}
