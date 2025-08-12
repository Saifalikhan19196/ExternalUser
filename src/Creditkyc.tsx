import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

// --- INTERFACES ---

interface FinancialFigureRow {
    current: string;
    last: string;
    previous: string;
}

interface Project {
    name: string;
    period: string;
}

interface FileWithPreview extends File {
    preview?: string;
}

interface FormData {
    CustomerType: string;
    regionCity: string;
    applicationDate?: string;
    customerchoice?: string;
    tradeNameArabic: string;
    tradeNameEnglish: string;
    businessType: string;
    commercialRegNo: string;
    companyRegistrationYear: string;
    unifiedNo: string;
    vatNo: string;
    mainActivity: string;
    managingDirector: string;
    authorizedSignatory: string;
    noOfBranches: string;
    noOfEmployees: string;
    nationalAddress: string;
    officialPhone: string;
    mobileNo: string;
    officialWebsite: string;
    paymentCycle: string;
    poApproverName: string;
    approverName: string;
    typeOfSecurity: string;
    paymentMethod: string;
    paymentMethodOther: string;
    creditLimitRequested: string;
    paymentTerm: string;
    financialFigures: Record<string, FinancialFigureRow>;
    auditorName: string;
    contractName: string;
    projects: Project[];
    simahTerms: string;
    requiredDocuments: string[];
    termsCompanyName: string;
    termsAuthorizedSignatory: string;
    termsNameOfSponsor: string;
    termsKAMName: string;
    termsStampFile: FileWithPreview | null;
    termsSponsorSignatureFile: FileWithPreview | null;
    termsAuthorizedSignatureFile: FileWithPreview | null;
    termsKAMSignatureFile: FileWithPreview | null;
    // Files for Required Documents section
    docAuthSignatoryIdFile: FileWithPreview | null;
    docMainCommCertFile: FileWithPreview | null;
    docVatCertFile: FileWithPreview | null;
    docBankStmtFile: FileWithPreview | null;
    docIncorpContractFile: FileWithPreview | null;
    docFinancialStmtFile: FileWithPreview | null;
    docPowerOfAttorneyFile: FileWithPreview | null;
    docSponsorIdFile: FileWithPreview | null;
}

interface ContactDetail {
    Name: string;
    Designation: string;
    Email: string;
    Contact: string;
    signatureFile: FileWithPreview | null;
}

interface FilePayload {
    fileName: string;
    contentType: string;
    content: string; // base64
}

const CreditCustomers = () => {
    // --- STATE MANAGEMENT ---
    const financialMetrics = [
        'Sales Proceed SAR MN', 'NIAT (profit after tax) SAR MN', 'Total Assets SAR MN', 'Receiveable SAR MN',
        'Total Liabilities SAR MN', 'Payables SAR MN', 'Short term Loan SAR MN', 'Capital SAR MN', 'Lubricant Consumed (Volume) Litres',
    ];

    const initialFormData: FormData = {
        CustomerType: 'CreditCustomers', regionCity: '', applicationDate: new Date().toISOString().split('T')[0], customerchoice: '',
        tradeNameArabic: '', tradeNameEnglish: '', businessType: '', commercialRegNo: '', companyRegistrationYear: '', unifiedNo: '',
        vatNo: '', mainActivity: '', managingDirector: '', authorizedSignatory: '', noOfBranches: '', noOfEmployees: '',
        nationalAddress: '', officialPhone: '', mobileNo: '', officialWebsite: '', paymentCycle: '', poApproverName: '',
        approverName: '', typeOfSecurity: '', paymentMethod: '', paymentMethodOther: '', creditLimitRequested: '', paymentTerm: '',
        financialFigures: financialMetrics.reduce((acc, metric) => {
            acc[metric] = { current: '', last: '', previous: '' };
            return acc;
        }, {} as Record<string, FinancialFigureRow>),
        auditorName: '', contractName: '', projects: Array.from({ length: 5 }, () => ({ name: '', period: '' })), simahTerms: '',
        requiredDocuments: [], termsCompanyName: '', termsAuthorizedSignatory: '', termsNameOfSponsor: '', termsKAMName: '',
        termsStampFile: null, termsSponsorSignatureFile: null, termsAuthorizedSignatureFile: null, termsKAMSignatureFile: null,
        // Initialize required document files
        docAuthSignatoryIdFile: null, docMainCommCertFile: null, docVatCertFile: null, docBankStmtFile: null,
        docIncorpContractFile: null, docFinancialStmtFile: null, docPowerOfAttorneyFile: null, docSponsorIdFile: null,
    };

    const createInitialContacts = (): ContactDetail[] =>
        Array.from({ length: 5 }, () => ({
            Name: "", Designation: "", Email: "", Contact: "", signatureFile: null,
        }));

    const [formData, setFormData] = React.useState<FormData>({ ...initialFormData });
    const [contacts, setContacts] = React.useState<ContactDetail[]>(createInitialContacts());
    const [loading, setLoading] = React.useState(false);
    const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
    const [activeContactIndex, setActiveContactIndex] = React.useState<number | null>(null);
    const [activeFieldName, setActiveFieldName] = React.useState<keyof FormData | null>(null);

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const Url = "https://prod-25.centralindia.logic.azure.com:443/workflows/5d163597298b424185cb0cb9e4b9b176/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=9W4uNSJYqSiUASKzpRIEIJUm9u3LoHXt6ugpWqmJc7U";

    // --- HANDLERS ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData((prev) => {
            let updatedList = prev.businessType ? prev.businessType.split(", ") : [];
            if (checked) { updatedList.push(value); } else { updatedList = updatedList.filter((item) => item !== value); }
            return { ...prev, businessType: updatedList.join(", ") };
        });
    };

    const handleRequiredDocsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData((prev) => {
            let updatedList = [...prev.requiredDocuments];
            if (checked) { updatedList.push(value); } else { updatedList = updatedList.filter((item) => item !== value); }
            return { ...prev, requiredDocuments: updatedList };
        });
    };

    const handleContactChange = (index: number, field: keyof Omit<ContactDetail, 'signatureFile'>, value: string) => {
        const updatedContacts = [...contacts];
        updatedContacts[index][field] = value;
        setContacts(updatedContacts);
    };

    const handleFinancialChange = (metric: string, year: keyof FinancialFigureRow, value: string) => {
        setFormData(prev => ({
            ...prev, financialFigures: { ...prev.financialFigures, [metric]: { ...prev.financialFigures[metric], [year]: value } }
        }));
    };

    const handleProjectChange = (index: number, field: keyof Project, value: string) => {
        const updatedProjects = [...formData.projects];
        updatedProjects[index][field] = value;
        setFormData(prev => ({ ...prev, projects: updatedProjects }));
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(",")[1];
                resolve(base64);
            };
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    };

    const handleContactUploadClick = (index: number) => {
        setActiveContactIndex(index);
        setActiveFieldName(null);
        fileInputRef.current?.click();
    };

    const handleGenericUploadClick = (fieldName: keyof FormData) => {
        setActiveContactIndex(null);
        setActiveFieldName(fieldName);
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (activeContactIndex !== null) {
            const updatedContacts = [...contacts];
            updatedContacts[activeContactIndex].signatureFile = file as FileWithPreview;
            setContacts(updatedContacts);
        } else if (activeFieldName) {
            setFormData(prev => ({ ...prev, [activeFieldName]: file as FileWithPreview }));
        }

        if (fileInputRef.current) { fileInputRef.current.value = ''; }
        setActiveContactIndex(null);
        setActiveFieldName(null);
    };

    const removeContactFile = (index: number) => {
        const updatedContacts = [...contacts];
        updatedContacts[index].signatureFile = null;
        setContacts(updatedContacts);
    };

    const removeGenericFile = (fieldName: keyof FormData) => {
        setFormData(prev => ({ ...prev, [fieldName]: null }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatusMessage(null);

        try {
            const filesPayload: FilePayload[] = [];

            // Process contact signature files
            await Promise.all(
                contacts
                    .map((contact, index) => ({ contact, index }))
                    .filter(item => item.contact.signatureFile)
                    .map(async item => {
                        const { contact, index } = item;
                        const file = contact.signatureFile!;
                        const base64Content = await fileToBase64(file);
                        filesPayload.push({
                            fileName: `Signature_${index}_0_${file.name}`,
                            contentType: file.type,
                            content: base64Content,
                        });
                    })
            );

            // Process all other standalone files (signatures, stamps, required documents)
            const fileFieldsToProcess: { field: keyof FormData; prefix: string }[] = [
                { field: 'termsStampFile', prefix: 'termsStamp_' },
                { field: 'termsSponsorSignatureFile', prefix: 'termsSignature1_' },
                { field: 'termsAuthorizedSignatureFile', prefix: 'termsSignature2_' },
                { field: 'termsKAMSignatureFile', prefix: 'termsSignature3_' },
                { field: 'docAuthSignatoryIdFile', prefix: 'Authorized_Signatory_ID_' },
                { field: 'docMainCommCertFile', prefix: 'Main_Commercial_Reg._Certificate_' },
                { field: 'docVatCertFile', prefix: 'VAT_registration_Certificate_' },
                { field: 'docBankStmtFile', prefix: 'Official_Bank_Statement_' },
                { field: 'docIncorpContractFile', prefix: 'Incorporation_Contract_for_the_company_' },
                { field: 'docFinancialStmtFile', prefix: 'Last_Audited_Financial_Statement_' },
                { field: 'docPowerOfAttorneyFile', prefix: 'Power_of_Attorney_if_Any_' },
                { field: 'docSponsorIdFile', prefix: 'Sponsor_ID_' },
            ];

            for (const { field, prefix } of fileFieldsToProcess) {
                const file = formData[field] as FileWithPreview | null;
                if (file) {
                    const base64Content = await fileToBase64(file);
                    filesPayload.push({
                        fileName: `${prefix}${file.name}`,
                        contentType: file.type,
                        content: base64Content,
                    });
                }
            }

            const financialFiguresString = JSON.stringify(
                Object.entries(formData.financialFigures).map(([metric, values]) => ({
                    metric: metric.trim(), currentYear: values.current, lastYear: values.last, previousYear: values.previous,
                }))
            );

            const contactsString = JSON.stringify(
                contacts.filter(c => c.Name || c.Designation || c.Email || c.Contact).map(({ signatureFile, ...rest }) => rest)
            );

            // Destructure to remove all file objects from the main payload before sending
            const {
                projects,
                termsStampFile, termsSponsorSignatureFile, termsAuthorizedSignatureFile, termsKAMSignatureFile,
                docAuthSignatoryIdFile, docMainCommCertFile, docVatCertFile, docBankStmtFile,
                docIncorpContractFile, docFinancialStmtFile, docPowerOfAttorneyFile, docSponsorIdFile,
                ...restOfFormData
            } = formData;

            const payload = {
                ...restOfFormData,
                financialFigures: financialFiguresString,
                contacts: contactsString,
                requiredDocuments: formData.requiredDocuments.join(', '),
                ProjectName: JSON.stringify(projects.map(p => p.name)),
                PeriodName: JSON.stringify(projects.map(p => p.period)),
                files: filesPayload,
            };

            const response = await fetch(Url, {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
            });

            if (response.ok) {
                setStatusMessage("Form submitted successfully!");
                setFormData({ ...initialFormData });
                setContacts(createInitialContacts());
            } else {
                throw new Error(`Server responded with status: ${response.status}`);
            }
        } catch (error) {
            console.error("Submission error:", error);
            setStatusMessage("Failed to submit form. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const requiredDocumentsList = [
        { key: 'docAuthSignatoryIdFile', value: 'Authorized Signatory ID', label: 'Authorized Signatory ID / هوية الشخص المفوض بالتوقيع' },
        { key: 'docMainCommCertFile', value: 'Main Commercial Reg. Certificate', label: 'Main Commercial Reg. Certificate / صورة السجل الرئيسي ساري المفعول' },
        { key: 'docVatCertFile', value: 'VAT registration Certificate', label: 'VAT registration Certificate / صورة من شهادة ضريبة القيمة المضافة' },
        { key: 'docBankStmtFile', value: 'Official Bank Statement (last 3 months)', label: 'Official Bank Statement (last 3 months) / كشف حساب بنكي رسمي لآخر ثلاث أشهر' },
        { key: 'docIncorpContractFile', value: 'Incorporation Contract for the company', label: 'Incorporation Contract for the company / عقد التأسيس' },
        { key: 'docFinancialStmtFile', value: 'Last Audited Financial Statement', label: 'Last Audited Financial Statement / آخر ميزانية مدققة' },
        { key: 'docPowerOfAttorneyFile', value: 'Power of Attorney if Any', label: 'Power of Attorney if Any / عقد التوكيل' },
        { key: 'docSponsorIdFile', value: 'Sponsor ID', label: 'Sponsor ID / هوية الكفيل' },
    ];


    // --- RENDER ---
    return (
        <div className="mt-4" style={{ color: 'black', width: '91vw', marginLeft: '4vw' }}>
            <input type="file" accept="image/*,.pdf" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />

            <form onSubmit={handleSubmit}>
                {/* --- CARD 1: CUSTOMER INFORMATION --- */}
                <div className="card mb-5" style={{ borderRadius: '15px', border: '2px solid #FCCE07' }}>
                    <div className="mb-2 text-center pt-2">
                        <h4 className="mb-0" style={{ color: '#1c325d', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            Credit Customers
                        </h4>
                    </div>
                    <div className="card-body" style={{ color: 'black' }}>
                        {/* Request Information */}
                        <div className="mb-5">
                            <div className="p-1 mb-4" style={{ backgroundColor: '#fbce07', borderRadius: '2px', color: '#EC1C24' }}>
                                <h6 className="mb-0">Request Information / معلومات الطلب</h6>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="regionCity" className="form-label">
                                        Region / City / المنطقة / المدينة <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        id="regionCity"
                                        name="regionCity"
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter region or city"
                                        onChange={handleChange}
                                        value={formData.regionCity}
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="applicationDate" className="form-label">
                                        Application Date / تاريخ الطلب <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        id="applicationDate"
                                        type="date"
                                        name="applicationDate"
                                        className="form-control"
                                        value={formData.applicationDate}
                                        onChange={handleChange}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label d-block">
                                    Customer Type / نوع العميل <span className="text-danger">*</span>
                                </label>
                                <div className="d-flex flex-wrap">
                                    {['Former', 'Current', 'New'].map((type) => (
                                        <div className="form-check form-check-inline me-4" key={type}>
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="customerchoice"
                                                id={`customerType${type}`}
                                                value={type}
                                                checked={formData.customerchoice === type}
                                                onChange={handleChange}
                                            />
                                            <label className="form-check-label" htmlFor={`customerType${type}`}>
                                                {type} / {type === 'Former' ? 'سابق' : type === 'Current' ? 'قائم' : 'جدید'}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div className="mb-5">
                            <div className="p-1 mb-4" style={{ backgroundColor: '#fbce07', borderRadius: '2px', color: '#EC1C24' }}>
                                <h6 className="mb-0">Basic Information / المعلومات الأساسية</h6>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="tradeNameArabic" className="form-label">
                                        Trade Name (Arabic) <span className="text-danger">*</span>
                                        <br />
                                        اسم العميل التجاري (عربي)
                                    </label>
                                    <br />
                                    <br />
                                    <input
                                        id="tradeNameArabic"
                                        type="text"
                                        name="tradeNameArabic"
                                        className="form-control"
                                        placeholder="Enter Arabic trade name"
                                        style={{ textAlign: 'right' }}
                                        value={formData.tradeNameArabic}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="tradeNameEnglish" className="form-label">
                                        Trade Name (English) <span className="text-danger">*</span>
                                        <br />
                                        اسم العميل التجاري (انجليزي)
                                    </label>
                                    <br />
                                    <br />
                                    <input
                                        id="tradeNameEnglish"
                                        type="text"
                                        name="tradeNameEnglish"
                                        className="form-control"
                                        placeholder="Enter English trade name"
                                        value={formData.tradeNameEnglish}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label d-block">
                                    Facility Type / نوع المنشأة <span className="text-danger">*</span>
                                </label>
                                <div className="row">
                                    <div className="col-md-6">
                                        {['Sole Proprietorship', 'Joint-stock'].map((type) => (
                                            <div className="form-check" key={type}>
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    name="businessType"
                                                    id={type.toLowerCase().replace(' ', '')}
                                                    value={type}
                                                    checked={formData.businessType.includes(type)}
                                                    onChange={handleCheckboxChange}
                                                />
                                                <label className="form-check-label" htmlFor={type.toLowerCase().replace(' ', '')}>
                                                    {type} / {type === 'Sole Proprietorship' ? 'فردية' : 'مساهمة'}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="col-md-6">
                                        {['Partnership', 'Limited Liability'].map((type) => (
                                            <div className="form-check" key={type}>
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    name="businessType"
                                                    id={type.toLowerCase().replace(' ', '')}
                                                    value={type}
                                                    checked={formData.businessType.includes(type)}
                                                    onChange={handleCheckboxChange}
                                                />
                                                <label className="form-check-label" htmlFor={type.toLowerCase().replace(' ', '')}>
                                                    {type} / {type === 'Partnership' ? 'تضامنية' : 'مسؤولية محدودة'}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-6 mb-3">
                                    <label htmlFor="commercialRegNo" className="form-label">
                                        Commercial Reg. No. <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        id="commercialRegNo"
                                        type="text"
                                        name="commercialRegNo"
                                        className="form-control"
                                        placeholder="Enter commercial registration number"
                                        value={formData.commercialRegNo}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-6 mb-3">
                                    <label htmlFor="registrationyear" className="form-label">
                                        Company registration year <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        id="registrationyear"
                                        type="text"
                                        name="companyRegistrationYear"
                                        className="form-control"
                                        value={formData.companyRegistrationYear}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="row mb-3">
                                <label htmlFor="UnifiedNo" className="col-md-12 col-form-label">
                                    Unified No
                                </label>
                                <div className="col-md-12">
                                    <input
                                        id="UnifiedNo"
                                        type="text"
                                        name="unifiedNo"
                                        className="form-control"
                                        value={formData.unifiedNo}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="vatNo" className="form-label">
                                    VAT No. / الرقم الضريبي <span className="text-danger">*</span>
                                </label>
                                <input
                                    id="vatNo"
                                    type="text"
                                    name="vatNo"
                                    placeholder="Enter VAT number"
                                    className="form-control"
                                    value={formData.vatNo}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="mainActivity" className="form-label">
                                    Main Activity / النشاط الرئيسي <span className="text-danger">*</span>
                                </label>
                                <input
                                    id="mainActivity"
                                    name="mainActivity"
                                    placeholder="Enter main activity"
                                    type="text"
                                    className="form-control" value={formData.mainActivity}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="managingDirector" className="form-label">
                                    Managing Director / المدير المسئول <span className="text-danger">*</span>
                                </label>
                                <input
                                    id="managingDirector"
                                    type="text"
                                    name="managingDirector"
                                    className="form-control"
                                    placeholder="Enter managing director name"
                                    value={formData.managingDirector}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="authorizedSignatory" className="form-label">
                                    Authorized Signatory / المفوض بالتوقيع <span className="text-danger">*</span>
                                </label>
                                <input
                                    id="authorizedSignatory"
                                    type="text"
                                    className="form-control"
                                    name="authorizedSignatory"
                                    placeholder="Enter authorized signatory name"
                                    value={formData.authorizedSignatory}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="noOfBranches" className="form-label">
                                        No. of Branches / عدد الفروع <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        id="noOfBranches"
                                        type="text"
                                        className="form-control"
                                        name="noOfBranches"
                                        placeholder="Enter number of branches"
                                        value={formData.noOfBranches}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="noOfEmployees" className="form-label">
                                        No. of Employees / عدد الموظفين <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        id="noOfEmployees"
                                        type="text"
                                        className="form-control"
                                        name="noOfEmployees"
                                        placeholder="Enter number of employees"
                                        value={formData.noOfEmployees}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="nationalAddress" className="form-label">
                                    National Address / العنوان الوطني <span className="text-danger">*</span>
                                </label>
                                <input
                                    id="nationalAddress"
                                    type="text"
                                    className="form-control"
                                    name="nationalAddress"
                                    placeholder="Enter national address"
                                    value={formData.nationalAddress}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="officialPhone" className="form-label">
                                        Official Phone / الهاتف الرسمي <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        id="officialPhone"
                                        type="tel"
                                        className="form-control"
                                        name="officialPhone"
                                        placeholder="Enter official phone" value={formData.officialPhone}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="mobileNo" className="form-label">
                                        Mobile No / الجوال <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        id="mobileNo"
                                        type="tel"
                                        className="form-control"
                                        name="mobileNo"
                                        placeholder="Enter mobile number"
                                        value={formData.mobileNo}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="officialWebsite" className="form-label">
                                    Official Website / الموقع الالكتروني
                                </label>
                                <input
                                    id="officialWebsite"
                                    type="url"
                                    className="form-control"
                                    name="officialWebsite"
                                    placeholder="Enter official website URL"
                                    value={formData.officialWebsite}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Authorized Finance and Procurement Department Staff */}
                        <div className="mb-5">
                            <div className="p-1 mb-4" style={{ backgroundColor: '#fbce07', borderRadius: '2px', color: '#EC1C24' }}>
                                <h6 className="mb-0">
                                    Authorized Finance and Procurement Department Staff / المعتمدين في قسم المالية و المشتريات لدى الشركة
                                </h6>
                            </div>
                            <div className="row">
                                <div className="col-md-4">
                                    <div className="mb-3">
                                        <label htmlFor="PymentCycle" className="form-label">
                                            Payment cycle <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="paymentCycle"
                                            placeholder="Enter Payment cycle"
                                            className="form-control"
                                            id="PymentCycle"
                                            value={formData.paymentCycle}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="mb-3">
                                        <label htmlFor="poApproverName" className="form-label">
                                            PO Approver Name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="poApproverName"
                                            name="poApproverName"
                                            placeholder="Enter PO approver Name"
                                            value={formData.poApproverName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="mb-3">
                                        <label htmlFor="ApproverName" className="form-label">
                                            Payment Approver Name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="ApproverName"
                                            name="approverName"
                                            placeholder="Enter Payment approver Name"
                                            value={formData.approverName}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label htmlFor="ContractDetails" className="col-form-label">
                                        Contact Details
                                    </label>
                                    <div className="col-md-12">
                                        <table className="table table-bordered text-center" style={{ border: '2px solid #F4C542', backgroundColor: '#FFF8E1' }}>
                                            <thead style={{ backgroundColor: '#F4C542' }}>
                                                <tr>
                                                    <th>الاسم<br />Name</th>
                                                    <th>المسمى الوظيفي<br />Designation</th>
                                                    <th>البريد الإلكتروني<br />Email</th>
                                                    <th>رقم التواصل<br />Contact Details</th>
                                                    <th>التوقيع<br />Signature</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {contacts.map((contact, i) => (
                                                    <tr key={i}>
                                                        <td>
                                                            <input
                                                                style={{ marginTop: '19px' }}
                                                                type="text"
                                                                className="form-control"
                                                                value={contact.Name}
                                                                onChange={e => handleContactChange(i, 'Name', e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                style={{ marginTop: '19px' }}
                                                                type="text"
                                                                className="form-control"
                                                                value={contact.Designation}
                                                                onChange={e => handleContactChange(i, 'Designation', e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                style={{ marginTop: '19px' }}
                                                                type="email"
                                                                className="form-control"
                                                                value={contact.Email}
                                                                onChange={e => handleContactChange(i, 'Email', e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                style={{ marginTop: '19px' }}
                                                                type="text"
                                                                className="form-control"
                                                                value={contact.Contact}
                                                                onChange={e => handleContactChange(i, 'Contact', e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-primary btn-sm"
                                                                style={{ margin: "auto", display: "block", minWidth: "120px", marginTop: "26px" }}
                                                                onClick={() => handleContactUploadClick(i)}
                                                            >
                                                                Signature Upload
                                                            </button>
                                                            {contact.signatureFile && (
                                                                <div className="mt-2 p-1 border rounded d-flex justify-content-between align-items-center" style={{ backgroundColor: 'white' }}>
                                                                    <span className="text-truncate" style={{ maxWidth: '120px' }}>
                                                                        {contact.signatureFile.name}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeContactFile(i)}
                                                                        className="btn-close"
                                                                        aria-label="Remove"
                                                                    ></button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- CARD 2: SECURITY DEPOSIT, FINANCIALS, TERMS --- */}
                <div className="card mb-5" style={{ borderRadius: '15px', border: '2px solid #FCCE07' }}>
                    <div className="card-body" style={{ color: 'black' }}>
                        {/* Security Deposit */}
                        <div className="p-1 mb-4" style={{ backgroundColor: '#fbce07', borderRadius: '2px', color: '#EC1C24' }}>
                            <h6 className="mb-0">Security Deposit</h6>
                        </div>
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label d-block">Security Type / نوع الضمان المقدم</label>
                                <div className="d-flex flex-wrap">
                                    {['Bank Guarantee', 'Promissory note', 'Letter of Credit', 'Unwilling to provide any Security'].map((type) => (
                                        <div className="form-check form-check-inline" key={type}>
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="typeOfSecurity"
                                                id={type.toLowerCase().replace(/\s/g, '')}
                                                value={type}
                                                checked={formData.typeOfSecurity === type}
                                                onChange={handleChange}
                                            />
                                            <label className="form-check-label" htmlFor={type.toLowerCase().replace(/\s/g, '')}>
                                                {type} / {type === 'Bank Guarantee' ? 'ضمان بنكي' : type === 'Promissory note' ? 'سند لأمر' : type === 'Letter of Credit' ? 'خطاب اعتماد' : 'غير راغب في تقديم اي ضمان'}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label d-block">Payment Method / طريقة الدفع</label>
                                <div className="d-flex flex-wrap">
                                    {['Bank Transfer', 'Online payment', 'Cheque', 'Certified Cheque', 'Other'].map((method) => (
                                        <div className="form-check form-check-inline" key={method}>
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="paymentMethod"
                                                id={method.toLowerCase().replace(/\s/g, '')}
                                                value={method}
                                                checked={formData.paymentMethod === method}
                                                onChange={handleChange}
                                            />
                                            <label className="form-check-label" htmlFor={method.toLowerCase().replace(/\s/g, '')}>
                                                {method} / {method === 'Bank Transfer' ? 'تحويل مصرفي' : method === 'Online payment' ? 'الدفع عبر الإنترنت' : method === 'Cheque' ? 'شيك' : method === 'Certified Cheque' ? 'شيك معتمد' : 'اخرى'}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {formData.paymentMethod === 'Other' && (
                                    <input
                                        type="text"
                                        name="paymentMethodOther"
                                        className="form-control mt-2"
                                        placeholder="Please specify"
                                        value={formData.paymentMethodOther}
                                        onChange={handleChange}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <label htmlFor="creditLimitRequested" className="form-label">
                                    Credit Limit Requested / الحد الائتماني المطلوب
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="creditLimitRequested"
                                    name="creditLimitRequested"
                                    value={formData.creditLimitRequested}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-md-6">
                                <label htmlFor="paymentTerm" className="form-label">
                                    Payment Term / فترة الدفع
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="paymentTerm"
                                    name="paymentTerm"
                                    value={formData.paymentTerm}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Financial Figures */}
                        <div className="mb-5">
                            <div className="p-1 mb-4" style={{ backgroundColor: '#fbce07', borderRadius: '2px', color: '#EC1C24' }}>
                                <h6 className="mb-0">Financial Figures / الأرقام المالية ( مليون / ر.س )</h6>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-bordered text-center">
                                    <thead className="align-middle table-light">
                                        <tr>
                                            <th></th>
                                            <th>Current Year</th>
                                            <th>Last Year</th>
                                            <th>Previous Year</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {financialMetrics.map((metric) => (
                                            <tr key={metric}>
                                                <td className="text-start align-middle">{metric}</td>
                                                <td><input type="text" className="form-control" value={formData.financialFigures[metric].current} onChange={(e) => handleFinancialChange(metric, 'current', e.target.value)} /></td>
                                                <td><input type="text" className="form-control" value={formData.financialFigures[metric].last} onChange={(e) => handleFinancialChange(metric, 'last', e.target.value)} /></td>
                                                <td><input type="text" className="form-control" value={formData.financialFigures[metric].previous} onChange={(e) => handleFinancialChange(metric, 'previous', e.target.value)} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Main Project And Contracts */}
                        <div className="mb-5">
                            <div className="p-1 mb-3" style={{ backgroundColor: '#fbce07', borderRadius: '2px', color: '#EC1C24' }}>
                                <h6 className="mb-0">Main Project And Contracts</h6>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="AuditorName" className="form-label">
                                        Auditor Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        id="AuditorName"
                                        type="text"
                                        className="form-control"
                                        name="auditorName"
                                        placeholder="Enter auditor name"
                                        value={formData.auditorName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="ContractName" className="form-label">
                                        Contract Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        id="ContractName"
                                        type="text"
                                        className="form-control"
                                        name="contractName"
                                        placeholder="Enter contract name"
                                        value={formData.contractName}
                                        onChange={handleChange}
                                    />
                                </div>
                                {formData.projects.map((_, i) => (
                                    <React.Fragment key={i}>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Project Name {i + 1}</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder={`Project Name ${i + 1}`}
                                                value={formData.projects[i].name}
                                                onChange={(e) => handleProjectChange(i, 'name', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Project Period {i + 1}</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder={`Project Period ${i + 1}`}
                                                value={formData.projects[i].period}
                                                onChange={(e) => handleProjectChange(i, 'period', e.target.value)}
                                            />
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* BAYAN Terms and Conditions */}
                        <div className="p-1 mb-4 text-center" style={{ backgroundColor: '#fbce07', borderRadius: '2px', color: '#EC1C24' }}>
                            <h6 className="mb-0">
                                (BAYAN) TERM & CONDITION FOR CUSTOMER DATA COLLECTED / شروط واحكام بخصوص بيانات العميل التي يتم تجميعها
                            </h6>
                        </div>
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <p style={{ fontSize: '0.8rem' }}>Data supplied, whether personal or otherwise, by Customer and/or which relates to a Customer's account will be held and processed by computer or otherwise by Al Jomaih and Shell Lubricating Oil Company Ltd to operate Customer's account(s); to confirm, update and enhance Al Jomaih and Shell Lubricating Oil Company Ltd's Customer records; for statistical analysis; to establish any identity or otherwise as required under applicable legislation; to assess each Customer's credit status on an ongoing basis; and otherwise as considered necessary or appropriate by Al Jomaih and Shell Lubricating Oil Company Ltd. Al Jomaih and Shell Lubricating Oil Company Limited is also a member of Bayan Credit Beaurue.</p>
                                <p style={{ fontSize: '0.8rem' }}>In each case the processing may continue after this Agreement has ended. Alternatively, Customer may be requested to complete or fulfil other checks as may be necessary to satisfy credit assessments, money laundering or fraud detection requirements.</p>
                                <p style={{ fontSize: '0.8rem' }}>Al Jomaih and Shell Lubricating Oil Company Ltd may disclose data relating to Customer and/or a Customer's account(s) to: (a) a credit reference agency where it may be accessed by other financial institutions to assist assessment of any application for credit made to Al Jomaih and Shell Lubricating Oil Company Ltd and for debt tracing and fraud prevention;</p>
                                <p style={{ fontSize: '0.8rem' }}>I hereby, acknowledge and agree to provide both Al Jomaih and Shell Lubricating Oil Company Ltd and Bayan Credit Information Company (Bayan) with any information required by either of them, in preparation for obtaining any of the services and products issued by Bayan, and/or entering into any of its programs, and/or using any of the relevant services provided Bayan including my consent on the establishment of my credit record. I also authorize said entities jointly and/or severally to collect and keep all necessary data pertaining to me (which belongs to the entity and its owners if the customer was an entity), and to view my financial and credit data/information. I also acknowledge and confirm my approval on allowing Bayan to exchange and distribute my information by and between all relevant parties, including current and potential Bayan members, under special agreements to be signed with them to regulate the exchange of information.</p>
                                <p style={{ fontSize: '0.8rem' }}>(b) to any guarantor or person providing security in relation to Customer's obligations under this Agreement; (c) as required or permitted by law or any regulatory authority; (d) as otherwise considered necessary or appropriate by Al Jomaih and Shell Lubricating Oil Company Ltd.</p>
                            </div>
                            <div className="col-md-6 text-end">
                                <p style={{ fontSize: '0.8rem' }}>سيتم الاحتفاظ ومعالجة البيانات المقدمة من العميل وا أو تلك المتعلقة بحسابه سواء كانت شخصية او خلافها بواسطة الحاسوب او بواسطة شركة الجميح وشل لزيوت التشحيم المحدودة، وهي البيانات المتعلقه بحسابه \ حساباته للتأكيد وللتحديث ولتعزيز وتحسين سجلات العميل لدى شركة الجميح وشل لزيوت التشحيم المحدودة بغرض اجراء تحليل احصائي، لإنشاء اية هوية او خلافه حسب الطلب والانظمة السارية وللتقييم المستمر للوضع الائتماني لكل عميل. وخلاف ذلك حسب ما تعتبره شركة الجميح وشل لزيوت التشحيم المحدودة ضروريا أو وقد تستمر معالجة ومناولة هذه البيانات في كل حالة لما بعد انتهاء هذا الاتفاق. وقد يطلب بدلا من العميل اتمام او عمل شيكات أخرى حسب ما قد تتطلبه ضرورة متطلبات تلبية تقييم الائتمان، غسيل الأموال اوكشف الاحتيال.</p>
                                <p style={{ fontSize: '0.8rem' }}>يحق لشركة الجميح وشل لزيوت التشحيم المحدودة الافصاح عن هذه البيانات المتعلقة بالعميل و ا أو بحساباته الى : (أ ) وكالة مرجعية الائتمان حيث يمكن ان تصل اليها مؤسسات مالية أخرى للمساعدة في تقييم طلبات الائتمان المقدمة لشركة الجميح وشل لزيوت التشحيم المحدودة ولمتابعة الديون ومنع الاحتيال</p>
                                <p style={{ fontSize: '0.8rem' }}>وبهذا أقر وأوافق على تزويد كلا من شركة الجميح وشل لزيوت التشحيم المحدودة وشركة بيان للمعلومات الائتمانية ( بيان ) باية معلومات مطلوبة منهما، تحضيرا لأية خدمات أو منتجات صادرة بواسطة بيان و ١ أو ادخالها في اي من برامجها، و ١ أو استخدام أي من الخدمات المتعلقة بذلك والتي تقدمها بيان شاملة موافقتي على عمل سجل ائتماني لي . كما أفوض أيضا الشركات المذكورة متضامنين و ١ أو منفردين بجمع وحفظ جميع البيانات الضرورية المتعلقة بي ) والتي تخص الشركة / المؤسسة ومالكيها اذا كان العميل هو هذه الشركة \ المؤسسة ) والاطلاع على بياناتي ومعلوماتي المالية المتعلقة بالإئتمان. كما اأقر ايضا وأوكد موافقتي على السماح لبيان لتبادل وتوزيع معلوماتي بواسطة وبين جميع الاطراف التي لها علاقة بذلك، شاملة اعضاء بيان الحاليين والمحتملين بموجب الاتفاقيات خاصة تنظم تبادل المعلومات . ( ب ) الى أي ضامن او شخص يقدم ضمان على التزامات العميل القائمة بموجب هذا الاتفاق ) ج ) حسب الطلب او المسموح به قانونا او اية سلطة 1 منظمة . ( د ) او خلاف ذلك ومما يُعتبر ضروريا أو مناسبا لشركة الجميح وشل لزيوت التشحيم المحدودة.</p>
                            </div>
                        </div>

                        {/* SIMAH Terms and Conditions */}
                        <div className="p-1 my-4" style={{ backgroundColor: '#fbce07', borderRadius: '2px', color: '#EC1C24' }}>
                            <h6 className="mb-0">(SIMAH) Terms and Conditions for Customer Data</h6>
                        </div>
                        <div className="d-flex flex-wrap">
                            {['Individual', 'Commercial'].map((type) => (
                                <div className="form-check form-check-inline me-4" key={type}>
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="simahTerms"
                                        id={`customerdata${type}`}
                                        value={type}
                                        checked={formData.simahTerms === type}
                                        onChange={handleChange}
                                    />
                                    <label className="form-check-label" htmlFor={`customerdata${type}`}>
                                        {type}
                                    </label>
                                </div>
                            ))}
                        </div>

                        {formData.simahTerms === 'Individual' && (
                            <div className="mt-3 p-3 ">
                                <h6>Individual Terms and Conditions</h6>
                                <div className="mt-4 p-3 border bg-light" style={{ lineHeight: '1.8' }}>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <strong>
                                                I, the undersigned person acknowledge, that my personal data and information are true, accurate and complete, and I acknowledge my approval to authorize (AlJomaih & Shell Lubricating Oil Co. Ltd.) to establish and/or create and/or inquire and/or issue and/or review my credit record in Saudi Credit Bureau (SIMAH) and disclosing my previous, current and future credit information and data and sharing them with all current and potential members of the Saudi Credit Bureau (SIMAH) or any entity who’s   approved by the Saudi Central Bank
                                            </strong>
                                        </div>
                                        <div className="col-md-6" dir="rtl" lang="ar">
                                            <strong>
                                                أقر انا الموقع أدناه أن بياناتي ومعلوماتي الشخصية صحيحة ودقيقة وكاملة، وعليه أقر بموافقتي على تفويض (شركة الجميح وشل لزيوت التشحيم المحدودة) في تأسيس و/أو إنشاء و/أو الاستعلام و /أو إصدار و/أو مراجعة سجلي الائتماني لدى الشركة السعودية للمعلومات الائتمانية (سمة) والافصاح عن معلوماتي وبياناتي الائتمانية السابقة والحالية والمستقبلية ومشاركتها مع كافة أعضاء الشركة السعودية للمعلومات الائتمانية (سمة) الحاليين والمحتملين أو لأي جهة يقرها البنك المركزي السعودي
                                            </strong>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <p><strong>
                                                We read and understand the above customer consent and we confirm that we fully understand how to use it and the importance of having the approval from the authorized person before the inquiry.
                                            </strong></p>
                                        </div>
                                        <div className="col-md-6" dir="rtl" lang="ar">
                                            <strong> تم قرأءة اقرار العميل أعلاه، ونؤكد على فهم ألية تطبيق الاقرار وأهمية أخذ موافقة العميل من الشخص المخول بالتوقيع قبل ، وعليه نوقع: الاستعلام</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {formData.simahTerms === 'Commercial' && (
                            <div className="mt-3 p-3 ">
                                <h6>Commercial Terms and Conditions</h6>
                                <div className="mt-4 p-3 border bg-light" style={{ lineHeight: '1.8' }}>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <strong>
                                                the undersigned person acknowledge I,, on behalf of (the name of the company or institution) that the data and information of (the name of the company or institution) are true, accurate and complete, and I also acknowledge that I agree on behalf of (the name of the company or institution) to authorize (AlJomaih & Shell Lubricating Oil Co. Ltd.)  to establish and/or create and/or inquire and/or issue and/ or review the credit record of (the name of the company or institution)in Saudi Credit Bureau (SIMAH) and disclose its previous, current and future credit information and data and sharing them with all current and potential members of the Saudi Credit Bureau (SIMAH) or any entity who’s   approved by the Central Bank
                                                I also agree, on behalf of the (company or / institution) to inquire about commercial data, information, financial statements, and other relevant information from authorized sources, to disclose and exchange them with all current and / or / potential members of credit information companies.
                                            </strong>
                                        </div>
                                        <div className="col-md-6" dir="rtl" lang="ar">
                                            <strong>
                                                أقر انا الموقع أدناه  بالنيابة عن( اسم الشركة أو المؤسسة)  أن بيانات ومعلومات ( اسم الشركة أو المؤسسة) صحيحة ودقيقة وكاملة، كما أقر بالموافقة بالنيابة عن( اسم الشركة أو المؤسسة)  على تفويض (شركة الجميح وشل لزيوت التشحيم المحدودة) في تأسيس و/أو إنشاء و/أو الاستعلام و /أو إصدار و/أو مراجعة السجل الائتماني لـ( اسم الشركة أو المؤسسة) لدى الشركة السعودية للمعلومات الائتمانية (سمة) والافصاح عن معلوماتها وبياناتها الائتمانية السابقة والحالية والمستقبلية ومشاركتها مع كافة أعضاء الشركة السعودية للمعلومات الائتمانية (سمة) الحاليين والمحتملين أو لأي جهة يقرّها البنك المركزي السعودي
                                                كما أوافق بالنيابة عن ( الشركة أو المؤسسة) عن الاستعلام عن البيانات والمعلومات التجارية والقوائم المالية وغيرها من المعلومات ذات العلاقة من المصادر المصرّحة والافصاح عنها وتبادلها مع كافة أعضاء شركات المعلومات الائتمانية الحاليين و/أو/ المحتملين.
                                            </strong>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <p><strong>We read and understand the above customer consent and we confirm that we fully understand how to use it and the importance of having the approval from the authorized person before the inquiry.</strong></p>
                                        </div>
                                        <div className="col-md-6" dir="rtl" lang="ar">
                                            <p><strong>تم قرأءة اقرار العميل أعلاه، ونؤكد على فهم ألية تطبيق الاقرار وأهمية أخذ موافقة العميل من الشخص المخول بالتوقيع قبل الاستعلام، وعليه نوقع:</strong></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <p className="fw-bold mt-4">
                            I hereby confirm that the information provided above is correct and to the best of my Knowledge, and I am authorized to sign this declaration on behalf of the company. / بهذا أقر بأن المعلومات المقدمة أعلاه صحيحة على حد علمي الجيد ، وأنا المفوض بالتوقيع على نموذج الطلب هذا بالنيابة عن الشركة.
                        </p>
                        <div className="row mt-4">
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label htmlFor="termsCompanyName" className="form-label">Company Name / اسم الشركة</label>
                                    <input type="text" className="form-control" id="termsCompanyName" name="termsCompanyName" value={formData.termsCompanyName} onChange={handleChange} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="termsStampFile" className="form-label">Company Stamp / الختم اسم الشركة</label><br />
                                    <button type="button" className="btn btn-outline-primary btn-sm mt-2" onClick={() => handleGenericUploadClick('termsStampFile')}>
                                        Upload Company Stamp
                                    </button>
                                    {formData.termsStampFile && (
                                        <div className="mt-2 p-1 border rounded d-flex justify-content-between align-items-center">
                                            <span className="text-truncate" style={{ maxWidth: '150px' }}>{formData.termsStampFile.name}</span>
                                            <button type="button" onClick={() => removeGenericFile('termsStampFile')} className="btn-close" aria-label="Remove"></button>
                                        </div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="termsNameOfSponsor" className="form-label">Name of Sponsor / اسم الكفيل</label>
                                    <input type="text" className="form-control" id="termsNameOfSponsor" name="termsNameOfSponsor" value={formData.termsNameOfSponsor} onChange={handleChange} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="termsSponsorSignatureFile" className="form-label">Sponsor Signature / التوقيع اسم الكفيل</label><br />
                                    <button type="button" className="btn btn-outline-primary btn-sm mt-2" onClick={() => handleGenericUploadClick('termsSponsorSignatureFile')}>
                                        Upload Sponsor Signature
                                    </button>
                                    {formData.termsSponsorSignatureFile && (
                                        <div className="mt-2 p-1 border rounded d-flex justify-content-between align-items-center">
                                            <span className="text-truncate" style={{ maxWidth: '150px' }}>{formData.termsSponsorSignatureFile.name}</span>
                                            <button type="button" onClick={() => removeGenericFile('termsSponsorSignatureFile')} className="btn-close" aria-label="Remove"></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="mb-3">
                                    <label htmlFor="termsAuthorizedSignatory" className="form-label">Authorized Signatory / اسم المفوض</label>
                                    <input type="text" className="form-control" id="termsAuthorizedSignatory" name="termsAuthorizedSignatory" value={formData.termsAuthorizedSignatory} onChange={handleChange} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="termsAuthorizedSignatureFile" className="form-label">Authorized Signature / التوقيع اسم المفوض</label><br />
                                    <button type="button" className="btn btn-outline-primary btn-sm mt-2" onClick={() => handleGenericUploadClick('termsAuthorizedSignatureFile')}>
                                        Upload Authorized Signature
                                    </button>
                                    {formData.termsAuthorizedSignatureFile && (
                                        <div className="mt-2 p-1 border rounded d-flex justify-content-between align-items-center">
                                            <span className="text-truncate" style={{ maxWidth: '150px' }}>{formData.termsAuthorizedSignatureFile.name}</span>
                                            <button type="button" onClick={() => removeGenericFile('termsAuthorizedSignatureFile')} className="btn-close" aria-label="Remove"></button>
                                        </div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="termsKAMName" className="form-label">KAM Name / اسم مدير الحساب</label>
                                    <input type="text" className="form-control" id="termsKAMName" name="termsKAMName" value={formData.termsKAMName} onChange={handleChange} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="termsKAMSignatureFile" className="form-label">KAM Signature / التوقيع اسم مدير الحساب</label><br />
                                    <button type="button" className="btn btn-outline-primary btn-sm mt-2" onClick={() => handleGenericUploadClick('termsKAMSignatureFile')}>
                                        Upload KAM Signature
                                    </button>
                                    {formData.termsKAMSignatureFile && (
                                        <div className="mt-2 p-1 border rounded d-flex justify-content-between align-items-center">
                                            <span className="text-truncate" style={{ maxWidth: '150px' }}>{formData.termsKAMSignatureFile.name}</span>
                                            <button type="button" onClick={() => removeGenericFile('termsKAMSignatureFile')} className="btn-close" aria-label="Remove"></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Required Documents */}
                        {/* <div className="p-1 my-4" style={{ backgroundColor: '#fbce07', borderRadius: '2px', color: '#EC1C24' }}>
                            <h6 className="mb-0">Required Documents / الاوراق المطلوبة</h6>
                        </div>
                        <div className="row">
                            {requiredDocumentsList.reduce((acc, doc, index) => {
                                const colIndex = Math.floor(index / 4);
                                if (!acc[colIndex]) { acc[colIndex] = []; }
                                acc[colIndex].push(doc);
                                return acc;
                            }, [] as typeof requiredDocumentsList[]).map((colDocs, colIndex) => (
                                <div className="col-md-6" key={colIndex}>
                                    {colDocs.map((doc) => (
                                        <div className="mb-3" key={doc.key}>
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    value={doc.value}
                                                    id={doc.key}
                                                    checked={formData.requiredDocuments.includes(doc.value)}
                                                    onChange={handleRequiredDocsChange}
                                                />
                                                <label className="form-check-label" htmlFor={doc.key}>
                                                    {doc.label}
                                                </label>
                                            </div>
                                            <button type="button" className="btn btn-outline-primary btn-sm mt-1" onClick={() => handleGenericUploadClick(doc.key as keyof FormData)}>
                                                Upload File
                                            </button>
                                            {formData[doc.key as keyof FormData] && (
                                                <div className="mt-2 p-1 border rounded d-flex justify-content-between align-items-center">
                                                    <span className="text-truncate" style={{ maxWidth: '150px' }}>{(formData[doc.key as keyof FormData] as File).name}</span>
                                                    <button type="button" onClick={() => removeGenericFile(doc.key as keyof FormData)} className="btn-close" aria-label="Remove"></button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div> */}

                        <div className="p-1 my-4" style={{ backgroundColor: '#fbce07', borderRadius: '2px', color: '#EC1C24' }}>
                            <h6 className="mb-0">Required Documents / الاوراق المطلوبة</h6>
                        </div>

                        <div className="row">
                            {requiredDocumentsList
                                .reduce((acc, doc, index) => {
                                    const colIndex = Math.floor(index / 4);
                                    if (!acc[colIndex]) {
                                        acc[colIndex] = [];
                                    }
                                    acc[colIndex].push(doc);
                                    return acc;
                                }, [] as typeof requiredDocumentsList[])
                                .map((colDocs, colIndex) => (
                                    <div className="col-md-6" key={colIndex}>
                                        {colDocs.map((doc) => (
                                            <div className="mb-3" key={doc.key}>
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        value={doc.value}
                                                        id={doc.key}
                                                        checked={formData.requiredDocuments.includes(doc.value)}
                                                        onChange={handleRequiredDocsChange}
                                                    />
                                                    <label className="form-check-label" htmlFor={doc.key}>
                                                        {doc.label}
                                                    </label>
                                                </div>

                                                {/* Upload button disabled if checkbox is not checked */}
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary btn-sm mt-1"
                                                    disabled={!formData.requiredDocuments.includes(doc.value)}
                                                    onClick={() => handleGenericUploadClick(doc.key as keyof FormData)}
                                                >
                                                    Upload File
                                                </button>

                                                {/* Show file name & remove button if uploaded */}
                                                {formData[doc.key as keyof FormData] && (
                                                    <div className="mt-2 p-1 border rounded d-flex justify-content-between align-items-center">
                                                        <span
                                                            className="text-truncate"
                                                            style={{ maxWidth: '150px' }}
                                                        >
                                                            {(formData[doc.key as keyof FormData] as File).name}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeGenericFile(doc.key as keyof FormData)}
                                                            className="btn-close"
                                                            aria-label="Remove"
                                                        ></button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>

                {/* Submit and Exit Buttons */}
                <div className="text-center pb-3">
                    <button type="submit" className="btn" style={{ backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '5px', padding: '8px 16px', fontSize: '1rem', cursor: 'pointer' }} disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </form>

            {/* Loading Modal */}
            {loading && (
                <div className="modal fade show" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content text-center p-4">
                            <div className="spinner-border text-warning mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <h5>Submitting your form...</h5>
                        </div>
                    </div>
                </div>
            )}

            {/* Success / Error Message Modal */}
            {statusMessage && !loading && (
                <div className="modal fade show" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', inset: 0, zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content text-center p-4">
                            <h5>{statusMessage}</h5>
                            <button className="btn btn-primary mt-3" onClick={() => setStatusMessage(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreditCustomers;
