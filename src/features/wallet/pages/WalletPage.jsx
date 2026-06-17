import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Wallet, ArrowDownLeft, ArrowUpRight, Plus, Loader2, Landmark, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import PageShell from '../../../components/layout/PageShell.jsx';
import Button from '../../../components/ui/Button.jsx';
import Input from '../../../components/ui/Input.jsx';
import { selectCurrentUser } from '../../auth/authSlice.js';
import { useGetWalletDataQuery, useAddFundsMutation, useWithdrawFundsMutation } from '../walletApi.js';
import { useUpdateBankDetailsMutation } from '../../user/userApi.js';

export default function WalletPage() {
  const user = useSelector(selectCurrentUser);
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetWalletDataQuery({ page, limit: 10 });
  const [addFunds, { isLoading: adding }] = useAddFundsMutation();
  const [withdrawFunds, { isLoading: withdrawing }] = useWithdrawFundsMutation();
  const [updateBankDetails, { isLoading: updatingBank }] = useUpdateBankDetailsMutation();
  
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState(null); // 'add' or 'withdraw'
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankForm, setBankForm] = useState({
    accountHolderName: user?.bankDetails?.accountHolderName || '',
    accountNumber: user?.bankDetails?.accountNumber || '',
    ifscCode: user?.bankDetails?.ifscCode || '',
    bankName: user?.bankDetails?.bankName || '',
  });

  const balance = data?.data?.balance || 0;
  const transactions = data?.data?.transactions || [];
  const pagination = data?.data?.pagination;

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateBankDetails(bankForm).unwrap();
      toast.success('Bank details updated');
      setIsEditingBank(false);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update bank details');
    }
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount < 500) {
      return toast.error('Minimum withdrawal amount is ₹500');
    }

    try {
      if (action === 'withdraw') {
        await withdrawFunds(numAmount).unwrap();
        toast.success(`Successfully withdrew ₹${numAmount} to bank account`);
      }
      setAmount('');
      setAction(null);
    } catch (err) {
      toast.error(err?.data?.message || `Failed to withdraw funds`);
    }
  };

  if (user?.role === 'buyer') {
    return null; // or redirect
  }

  return (
    <PageShell>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-surface-800 mb-6 flex items-center gap-2">
          <Wallet className="w-6 h-6 text-primary-500" />
          My Wallet
        </h1>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <p className="text-primary-100 text-sm font-medium mb-1">Available Balance</p>
              <h2 className="text-4xl sm:text-5xl font-bold">₹{balance.toFixed(2)}</h2>
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <Button 
                onClick={() => setAction('withdraw')}
                className="bg-white text-primary-700 hover:bg-primary-50 flex-1 sm:flex-auto"
              >
                <Landmark className="w-4 h-4 mr-2" />
                Withdraw Funds
              </Button>
            </div>
          </div>
        </div>

        {/* Bank Details Card */}
        <div className="bg-white rounded-2xl border border-surface-100 p-6 mb-8 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-surface-800 flex items-center gap-2">
              <Building className="w-5 h-5 text-primary-500" />
              Bank Account Details
            </h3>
            {!isEditingBank && (
              <Button size="sm" variant="outline" onClick={() => setIsEditingBank(true)}>
                {user?.bankDetails?.accountNumber ? 'Edit' : 'Add Details'}
              </Button>
            )}
          </div>

          {isEditingBank ? (
            <form onSubmit={handleBankSubmit} className="space-y-4 animate-scale-in">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Account Holder Name"
                  placeholder="John Doe"
                  value={bankForm.accountHolderName}
                  onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                  required
                />
                <Input
                  label="Bank Name"
                  placeholder="HDFC Bank"
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  required
                />
                <Input
                  label="Account Number"
                  placeholder="1234567890"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  required
                />
                <Input
                  label="IFSC Code"
                  placeholder="HDFC0001234"
                  value={bankForm.ifscCode}
                  onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditingBank(false);
                  setBankForm({
                    accountHolderName: user?.bankDetails?.accountHolderName || '',
                    accountNumber: user?.bankDetails?.accountNumber || '',
                    ifscCode: user?.bankDetails?.ifscCode || '',
                    bankName: user?.bankDetails?.bankName || '',
                  });
                }}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={updatingBank}>
                  Save Details
                </Button>
              </div>
            </form>
          ) : user?.bankDetails?.accountNumber ? (
            <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div>
                <p className="text-surface-500 mb-0.5">Account Holder</p>
                <p className="font-medium text-surface-800">{user.bankDetails.accountHolderName}</p>
              </div>
              <div>
                <p className="text-surface-500 mb-0.5">Bank Name</p>
                <p className="font-medium text-surface-800">{user.bankDetails.bankName}</p>
              </div>
              <div>
                <p className="text-surface-500 mb-0.5">Account Number</p>
                <p className="font-medium text-surface-800">
                  •••• {user.bankDetails.accountNumber.slice(-4)}
                </p>
              </div>
              <div>
                <p className="text-surface-500 mb-0.5">IFSC Code</p>
                <p className="font-medium text-surface-800">{user.bankDetails.ifscCode}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-surface-500">
              No bank details added yet. You need to add them before you can withdraw funds.
            </p>
          )}
        </div>

        {/* Action Form (Withdraw) */}
        {action === 'withdraw' && (
          <div className="bg-white rounded-2xl border border-surface-100 p-6 mb-8 shadow-soft animate-scale-in">
            <h3 className="font-bold text-surface-800 mb-4 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-blue-500" />
              Withdraw to Bank Account
            </h3>
            
            {!user?.bankDetails?.accountNumber ? (
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-4 text-orange-800 text-sm">
                Please add your bank details in your Profile before withdrawing funds.
              </div>
            ) : null}

            <form onSubmit={handleTransaction} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-xs font-medium text-surface-500 mb-1">Amount (₹) - Min ₹500</label>
                <input
                  type="number"
                  min="500"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                  placeholder="Enter amount (min ₹500)"
                  required
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button type="button" variant="outline" onClick={() => { setAction(null); setAmount(''); }} className="flex-1 sm:flex-auto">
                  Cancel
                </Button>
                <Button type="submit" isLoading={withdrawing} className="flex-1 sm:flex-auto bg-primary-600 hover:bg-primary-700 text-white" disabled={!user?.bankDetails?.accountNumber}>
                  Confirm
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-white rounded-2xl border border-surface-100 shadow-soft overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100">
            <h3 className="font-bold text-surface-800">Recent Transactions</h3>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center text-surface-500">
              <Wallet className="w-12 h-12 text-surface-300 mx-auto mb-3" />
              <p>No transactions found.</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-100">
              {transactions.map((txn) => (
                <div key={txn._id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-surface-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      txn.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {txn.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-surface-800 capitalize">
                        {txn.purpose.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-surface-500">{txn.description}</p>
                      <p className="text-xs text-surface-400 mt-0.5">
                        {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className={`font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-surface-800'}`}>
                    {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-surface-100 flex justify-center gap-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                    page === p
                      ? 'gradient-primary text-white'
                      : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
